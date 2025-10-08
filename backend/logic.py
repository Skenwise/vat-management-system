from fastapi import FastAPI, Query, HTTPException, APIRouter
import numpy as np
import pandas as pd
from database import Database
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class DBConnection(BaseModel):
    server: str
    database: str
    username: str
    password: str

db_instance = None

@router.get("/")
async def home():
    return {"Your backend is running": "Yes"}

@router.post("/connect-db")
async def connect_db(conn: DBConnection):
    print(f"DEBUG: Connecting to server={conn.server}, database={conn.database}, username={conn.username} ")
    global db_instance
    try:
        db_instance = Database(conn.server, conn.database, conn.username, conn.password)
        db_instance.connect()
        print("DEBUG: Connection Successful!")
        return {"message": "Connection to the Database successfull"}
    except Exception as e:
        error_msg=str(e)
        print(f"DEBUG: Connection failed with error:{error_msg}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/vat-return")
async def report_2(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    end_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    StoreID: int = Query(None, description="Optional: Filter by specific store"),
    DepartmentID: int = Query(None, description="Optional: Filter by department")
):
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    conn = db_instance.get_connection()

    dept_filter = ""
    params = (start_date, end_date)
    if StoreID is not None:
        dept_filter += " AND te.StoreID = ?"
        params += (StoreID,)
    if DepartmentID is not None:
        dept_filter += " AND i.DepartmentID = ?"
        params += (DepartmentID,)

    base_query = f"""
    WITH DepartmentSales AS (
        SELECT 
            d.Name AS DepartmentName,
            SUM(te.Quantity * te.Price) AS SalesExclusive,
            SUM(te.SalesTax) AS SalesTax
        FROM TransactionEntry te
        JOIN Item i ON i.ID = te.ItemID
        JOIN Department d ON d.ID = i.DepartmentID
        JOIN [Transaction] t ON t.TransactionNumber = te.TransactionNumber
        WHERE t.Time >= ? AND t.Time <= ?{dept_filter}
        GROUP BY d.ID, d.Name
    )
    SELECT *
    FROM (
        SELECT 
            'TOTAL' AS DepartmentName,
            SUM(ds.SalesExclusive + ds.SalesTax) AS SalesInclusive,
            SUM(ds.SalesExclusive) AS SalesExclusive,
            SUM(ds.SalesTax) AS SalesTax,
            SUM((ds.SalesExclusive + ds.SalesTax - ds.SalesExclusive) * 6.25) AS Vatable,
            SUM(ds.SalesExclusive - ((ds.SalesExclusive + ds.SalesTax - ds.SalesExclusive) * 6.25)) AS NonVatable,
            0 AS SortOrder
        FROM DepartmentSales ds

        UNION ALL

        SELECT 
            ds.DepartmentName,
            (ds.SalesExclusive + ds.SalesTax) AS SalesInclusive,
            ds.SalesExclusive,
            ds.SalesTax,
            (ds.SalesExclusive + ds.SalesTax - ds.SalesExclusive) * 6.25 AS Vatable,
            ds.SalesExclusive - ((ds.SalesExclusive + ds.SalesTax - ds.SalesExclusive) * 6.25) AS NonVatable,
            1 AS SortOrder
        FROM DepartmentSales ds
    ) t
    ORDER BY t.SortOrder, t.DepartmentName;
    """

    try:
        print("VAT RETURN QUERY:", base_query)
        print("PARAMS:", params)
        df = pd.read_sql(base_query, conn, params=params)
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Database Query failed: {str(e)}")

    if df.empty:
        return {
            "departments": [],
            "summary": {
                "total_sales_inclusive": 0.0,
                "total_sales_exclusive": 0.0,
                "total_sales_tax": 0.0,
                "total_vatable": 0.0,
                "total_non_vatable": 0.0
            }
        }

    df = df.replace({np.nan: 0, np.inf: 0, -np.inf: 0})

    totals_row = df[df['DepartmentName'] == 'TOTAL'].iloc[0]
    summary = {
        "total_sales_inclusive": round(float(totals_row['SalesInclusive']), 2),
        "total_sales_exclusive": round(float(totals_row['SalesExclusive']), 2),
        "total_sales_tax": round(float(totals_row['SalesTax']), 2),
        "total_vatable": round(float(totals_row['Vatable']), 2),
        "total_non_vatable": round(float(totals_row['NonVatable']), 2)
    }

    departments_df = df[df['DepartmentName'] != 'TOTAL']

    departments_list = []
    for _, row in departments_df.iterrows():
        departments_list.append({
            "DepartmentName": row['DepartmentName'],
            "SalesInclusive": round(float(row['SalesInclusive']), 2),
            "SalesExclusive": round(float(row['SalesExclusive']), 2),
            "SalesTax": round(float(row['SalesTax']), 2),
            "Vatable": round(float(row['Vatable']), 2),
            "NonVatable": round(float(row['NonVatable']), 2)
        })

    return {
        "departments": departments_list,
        "summary": summary
    }

@router.get('/vat-summary')
async def vat_summary(
    start_date: str =Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD"),
    StoreID: int = Query(None, description="Optional: Filter by specific store")
):
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD")
    
    conn = db_instance.get_connection()

    transaction_query = """
            SELECT 
                CAST(Time as DATE) as TransactionDate,
                SUM(Total) - SUM(SalesTax) as TotalExcl,
                SUM(SalesTax) as TotalVAT,
                SUM(Total) as TotalIncl,
                COUNT(*) as TransactionCount
            FROM [Transaction]
            WHERE Time >= ? AND Time <= ?
        """
    
    params = (start_date, end_date)
    if StoreID is not None:
        transaction_query += " AND StoreID = ?"
        params += (StoreID,)
    
    transaction_query += " GROUP BY CAST(Time as DATE) ORDER BY CAST(Time AS Date)"
    
    try:
        df = pd.read_sql(transaction_query, conn, params=params)
        df = df.replace({np.nan: 0})

        print("DEBUG")
        print(df.head(10))
        print(df.dtypes)
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "summary": {
                "total_sales_excl_vat": round(df['TotalExcl'].sum(), 2),
                "total_vat_amount": round(df['TotalVAT'].sum(), 2),
                "total_sales_incl_vat": round(df['TotalIncl'].sum(), 2),
                "total_transactions": int(df['TransactionCount'].sum())
            },
            "daily_breakdown": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

@router.get("/departments")
async def get_departments():
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    conn = db_instance.get_connection()
    
    try:
        query = """
                WITH DepartmentSales AS (
                    SELECT 
                        d.Name AS DepartmentName,
                        d.ID AS DepartmentID,
                        SUM(te.Quantity * i.Cost) AS CostOfSales,
                        SUM(te.Quantity * te.Price) AS SalesExclusive,
                        SUM(te.SalesTax) AS SalesTax
                FROM TransactionEntry te
                JOIN Item i ON i.ID = te.ItemID
                JOIN Department d ON d.ID = i.DepartmentID
                JOIN [Transaction] t ON t.TransactionNumber = te.TransactionNumber
                GROUP BY d.ID, d.Name
                ),
                DepartmentStock AS (
                    SELECT
                        ios.DepartmentID,
                        SUM(ios.Quantity * ios.Cost) AS StockOnHandCost
                    FROM IX_ITEMOPENINGSTOCK ios
                    GROUP BY ios.DepartmentID
                ),
                TotalSales AS (
                    SELECT SUM(SalesExclusive) AS TotalSalesExclusive
                    FROM DepartmentSales
                )
                SELECT 
                    ds.DepartmentName,
                    ds.DepartmentID,
                    ISNULL(st.StockOnHandCost, 0) AS StockOnHandCost,
                    ds.CostOfSales,
                    ds.SalesExclusive,
                    (ds.SalesExclusive + ds.SalesTax) AS SalesInclusive,
                    (ds.SalesExclusive - ds.CostOfSales) AS GrossProfitValue,
                    CASE 
                        WHEN ds.SalesExclusive > 0 THEN ROUND((ds.SalesExclusive - ds.CostOfSales) / ds.SalesExclusive * 100, 2)
                        ELSE 0
                    END AS GrossProfitPercent,
                    CASE 
                        WHEN ts.TotalSalesExclusive > 0 THEN ROUND(ds.SalesExclusive / ts.TotalSalesExclusive * 100, 2)
                        ELSE 0
                    END AS SalesContributionPercent
                FROM DepartmentSales ds
                LEFT JOIN DepartmentStock st ON st.DepartmentID = ds.DepartmentID
                CROSS JOIN TotalSales ts
                ORDER BY ds.DepartmentName;
               """
        df = pd.read_sql(query, conn)
        return {"departments": df.to_dict(orient="records")}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch departments: {str(e)}")

@router.get("/vat-rates")
async def get_vat_rates(
    start_date: str = Query(None, description="Optional: Format YYYY-MM-DD"),
    end_date: str = Query(None, description="Optional: Format YYYY-MM-DD")
):
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    conn = db_instance.get_connection()

    # Build date filter if provided
    date_filter = ""
    params = ()
    if start_date and end_date:
        date_filter = " AND t.Time >= ? AND t.Time <= ?"
        params += (start_date, end_date)

    # Only aggregate items with transactions in the period
    query = f"""
        SELECT 
            t2.Percentage AS vat_rate,
            d.Name AS department,
            COUNT(DISTINCT i.ID) AS item_count,
            SUM(te.Quantity * te.Price) AS total_sales,
            SUM(te.SalesTax) AS total_vat
        FROM TransactionEntry te
        JOIN Item i ON te.ItemID = i.ID
        JOIN [Transaction] t ON te.TransactionNumber = t.TransactionNumber
        LEFT JOIN Tax t2 ON i.TaxID = t2.ID
        LEFT JOIN Department d ON i.DepartmentID = d.ID
        WHERE i.TaxID IS NOT NULL{date_filter}
        GROUP BY t2.Percentage, d.Name
        ORDER BY t2.Percentage, d.Name
    """
    try:
        print("VAT RATE QUERY:", query)
        print("PARAMS:", params)
        df = pd.read_sql(query, conn, params=params)
        result = df.astype(object).where(pd.notnull(df), None).to_dict(orient="records")
        return {"vat_rates": result}
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch VAT rates: {str(e)}")

@router.get("/sales-dashboard")
async def sales_dashboard(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD"),
    DepartmentID: int = Query(None, description="Optional: Filter by specific department")
):
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection")
    
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")
    
    conn = db_instance.get_connection()
    
    # Build filter for optional department
    dept_filter = ""
    params = (start_date, end_date)
    if DepartmentID is not None:
        dept_filter = " AND i.DepartmentID = ?"
        params += (DepartmentID,)

    # Summary Query
    summary_query = f"""
        SELECT 
            COUNT(DISTINCT t.TransactionNumber) as total_transactions,
            COUNT(DISTINCT CAST(t.Time as DATE)) as trading_days,
            SUM(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as total_sales_incl,
            SUM(te.Quantity * te.Price) as total_sales_excl,
            SUM(ISNULL(te.SalesTax, 0)) as total_tax,
            AVG(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as avg_transaction_value,
            SUM(te.Quantity) as total_items_sold
        FROM [Transaction] t
        JOIN TransactionEntry te ON t.TransactionNumber = te.TransactionNumber
        JOIN Item i ON te.ItemID = i.ID
        WHERE t.Time >= ? AND t.Time <= ?{dept_filter}
    """
    
    # Daily Sales by Department Query
    daily_by_dept_query = f"""
        SELECT 
            CAST(t.Time as DATE) as SaleDate,
            d.Name as DepartmentName,
            d.ID as DepartmentID,
            SUM(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as DailySales,
            COUNT(DISTINCT t.TransactionNumber) as TransactionCount
        FROM [Transaction] t
        JOIN TransactionEntry te ON t.TransactionNumber = te.TransactionNumber
        JOIN Item i ON te.ItemID = i.ID
        JOIN Department d ON i.DepartmentID = d.ID
        WHERE t.Time >= ? AND t.Time <= ?{dept_filter}
        GROUP BY CAST(t.Time as DATE), d.Name, d.ID
        ORDER BY CAST(t.Time as DATE), d.Name
    """
    
    # Top performing departments
    dept_summary_query = f"""
        SELECT 
            d.Name as DepartmentName,
            d.ID as DepartmentID,
            SUM(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as TotalSales,
            COUNT(DISTINCT t.TransactionNumber) as TransactionCount,
            AVG(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as AvgTransactionValue
        FROM [Transaction] t
        JOIN TransactionEntry te ON t.TransactionNumber = te.TransactionNumber
        JOIN Item i ON te.ItemID = i.ID
        JOIN Department d ON i.DepartmentID = d.ID
        WHERE t.Time >= ? AND t.Time <= ?{dept_filter}
        GROUP BY d.Name, d.ID
        ORDER BY TotalSales DESC
    """
    
    # Best sales day
    best_day_query = f"""
        SELECT TOP 1
            CAST(t.Time as DATE) as BestDate,
            SUM(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) as DaySales,
            COUNT(DISTINCT t.TransactionNumber) as Transactions
        FROM [Transaction] t
        JOIN TransactionEntry te ON t.TransactionNumber = te.TransactionNumber
        JOIN Item i ON te.ItemID = i.ID
        WHERE t.Time >= ? AND t.Time <= ?{dept_filter}
        GROUP BY CAST(t.Time as DATE)
        ORDER BY SUM(te.Quantity * te.Price + ISNULL(te.SalesTax, 0)) DESC
    """

    try:
        # Execute queries
        summary_df = pd.read_sql(summary_query, conn, params=params)
        daily_by_dept_df = pd.read_sql(daily_by_dept_query, conn, params=params)
        dept_summary_df = pd.read_sql(dept_summary_query, conn, params=params)
        best_day_df = pd.read_sql(best_day_query, conn, params=params)
        
        # Replace NaN and Inf values
        summary_df = summary_df.replace({np.nan: 0, np.inf: 0, -np.inf: 0})
        daily_by_dept_df = daily_by_dept_df.replace({np.nan: 0, np.inf: 0, -np.inf: 0})
        dept_summary_df = dept_summary_df.replace({np.nan: 0, np.inf: 0, -np.inf: 0})
        best_day_df = best_day_df.replace({np.nan: 0, np.inf: 0, -np.inf: 0})
        
        # Process summary
        summary = summary_df.iloc[0].to_dict() if not summary_df.empty else {}
        
        # Process best day
        best_day = {}
        if not best_day_df.empty:
            best_day = {
                "date": str(best_day_df.iloc[0]['BestDate']),
                "sales": round(float(best_day_df.iloc[0]['DaySales']), 2),
                "transactions": int(best_day_df.iloc[0]['Transactions'])
            }
        
        # Get best department
        best_dept = {}
        if not dept_summary_df.empty:
            best_dept = {
                "name": dept_summary_df.iloc[0]['DepartmentName'],
                "sales": round(float(dept_summary_df.iloc[0]['TotalSales']), 2),
                "transactions": int(dept_summary_df.iloc[0]['TransactionCount'])
            }
        
        return {
            "period": {
                "start_date": start_date, 
                "end_date": end_date
            },
            "summary": {
                "total_transactions": int(summary.get('total_transactions', 0)),
                "trading_days": int(summary.get('trading_days', 0)),
                "total_sales_incl": round(float(summary.get('total_sales_incl', 0)), 2),
                "total_sales_excl": round(float(summary.get('total_sales_excl', 0)), 2),
                "total_tax": round(float(summary.get('total_tax', 0)), 2),
                "avg_transaction_value": round(float(summary.get('avg_transaction_value', 0)), 2),
                "total_items_sold": int(summary.get('total_items_sold', 0)),
                "avg_daily_sales": round(float(summary.get('total_sales_incl', 0)) / max(int(summary.get('trading_days', 1)), 1), 2)
            },
            "best_day": best_day,
            "best_department": best_dept,
            "daily_by_department": daily_by_dept_df.to_dict(orient="records"),
            "department_summary": dept_summary_df.to_dict(orient="records")
        }
        
    except Exception as e:
        import traceback
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")