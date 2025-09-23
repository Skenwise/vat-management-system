from fastapi import FastAPI, Query, HTTPException, APIRouter
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

# store connection object globally after login
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
async def vat_report(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    end_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    StoreID: int = Query(None, description="Optional: Filter by specicifc order")
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

    base_query = f"""
            SELECT
                te.StoreID,
                t.Time  AS TransactionDate,
                t.BatchNumber,
                te.SalesTax AS VAT_Amount,
                (te.Price * te.Quantity + te.SalesTax) AS Total_Incl,
                (te.Price * te.Quantity) AS Total_Excl,
                s.Name AS StoreName,
                i.TaxID as ItemTaxID,
                tx.Percentage AS ItemVATRate
                FROM TransactionEntry te
                LEFT JOIN [Transaction] t ON te.TransactionNumber = t.TransactionNumber
                LEFT JOIN item i ON te.ItemID = i.ID
                LEFT JOIN Tax tx on i.TaxID = tx.ID
                LEFT JOIN Store s on te.StoreID = s.ID
                WHERE t.Time >= ? AND t.Time <= ?       
    """

    params =  [start_date, end_date]

    if StoreID:
        base_query += " AND te.StoreID = ? "
        params.append(str(StoreID))
    
    base_query += "ORDER BY TransactionDate"

    try:
        df = pd.read_sql(base_query, conn, params=tuple(params))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Database Query failed: {str(e)}")

    if df.empty:
        return{
            "transactions": [],
            "summary": {
                "total_transactions": 0,
                "total_sales_excl_vat": 0.0,
                "total_vat_amount": 0.0,
                "total_sales_incl_vat": 0.0,
                "total_discounts": 0.0
            },
            "vat_breakdown": [],
            "store_breakdown": []
        }
    

    
    # calculate totals
    total_transactions = len(df)
    total_sales_excl=df['Total_Excl'].sum()
    total_vat = df['VAT_Amount'].sum()
    total_sales_incl = df['Total_Incl'].sum()
    total_discounts = df['Discount_Amount'].sum()

    # VAT breakdown by rate
    vat_breakdown = df.groupby('ItemVATRate').agg({
        'Total_Excl': 'sum',
        'VAT_Amount': 'sum',
        'Total_Incl': 'sum'
    }).reset_index()

    vat_breakdown_list = []
    for _, row in vat_breakdown.iterrows():
        vat_rate = row['ItemVATRate'] if pd.notna(row['ItemVATRate']) else 0.0
        vat_breakdown_list.append({
            "vat_rate": float(vat_rate),
            "sales_excl_vat": round(float(row['Total_Excl']), 2),
            "vat_amount": round(float(row["VAT_Amount"]), 2),
            "sales_incl_vat": round(float(row['Total_Incl']), 2)
        })

    # store breakdown 
    store_breakdown = df.groupby(['StoreID', 'StoreName']).agg({
        'Total_Excl': 'sum',
        'VAT_Amount': 'sum',
        'Total_Incl': 'sum'
    }).reset_index()

    store_breakdown_list = []
    for _, row in store_breakdown.iterrows():
        store_breakdown_list.append({
            "StoreID": int(row['StoreID']),
            "store_name": row['StoreName'] if pd.notna(row['StoreName']) else f"Store {row['StoreID']}",
            "sales_excl_vat": round(float(row['Total_Excl']), 2),
            "vat_amount": round(float(row['VAT_Amount']), 2),
            "sales_incl_vat": round(float(row['Total_Incl']), 2)
        })

    return {
            "transactions": df.to_dict(orient="records"),
            "summary": {
                "total_transactions": total_transactions,
                "total_sales_excl_vat": round(total_sales_excl, 2),
                "total_vat_amount": round(total_vat, 2),
                "total_sales_incl_vat": round(total_sales_incl, 2),
                "total_discounts": round(total_discounts, 2)
            },
            "vat_breakdown": vat_breakdown_list,
            "store_breakdown": store_breakdown_list
        }

@router.get('/vat-summary')
async def vat_summary(
    start_date: str =Query(..., description="Format: YYYY-MM-DD"),
    end_date: str = Query(..., description="Format: YYYY-MM-DD"),
    StoreID: int = Query(None, description="Optional: Filter by specific store")
):
    # Simple VAT summary
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    try:
        datetime.strptime(start_date, "%Y-%m-%d")
        datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD")
    
    conn = db_instance.get_connection()

    summary_query = """
        SELECT 
            Date AS SummaryDate,
            Total AS GrossSales,
            StoreID
        FROM DailySales
        WHERE Date >= ? AND Date <= ?
        ORDER BY Date 
    """

    try:
        df = pd.read_sql(summary_query, conn, params=[start_date, end_date])

        if not df.empty:
            return {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "summary": {
                    "total_gross_sales": round(df['GrossSales'].sum(), 2),
                    "total_taxable_sales": round(df['TaxableSales'].sum(), 2),
                    "total_non_taxable_sales": round(df['NonTaxableSales'].sum(), 2),
                    "total_vat_amount": round(df['TaxAmount'].sum(), 2),
                    "total_discounts": round(df['Discounts'].sum(), 2)
                },
                "daily_breakdown": df.to_dict(orient="records")
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
        

    
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
    
    params = [start_date, end_date]
    if StoreID:
        transaction_query += " AND StoreID = ?"
        params.append(str(StoreID))
    
    transaction_query += " GROUP BY CAST(Time as DATE) ORDER BY CAST(Time AS Date)"
    
    try:
        df = pd.read_sql(transaction_query, conn, params=tuple(params))
        
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

@router.get("/stores")
async def get_stores():
    """Get all available stores"""
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    conn = db_instance.get_connection()
    
    try:
        df = pd.read_sql("SELECT ID, Name, StoreCode FROM Store ORDER BY Name", conn)
        return {"stores": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stores: {str(e)}")

@router.get("/vat-rates")
async def get_vat_rates():
    """Get all VAT rates used in items"""
    global db_instance
    if not db_instance:
        raise HTTPException(status_code=400, detail="No database connection. Please connect to the database")
    
    conn = db_instance.get_connection()
    
    try:
        df = pd.read_sql("""
            SELECT 
                    t2.Percentage AS vat_rate,
                    COUNT(*) AS item_count
            FROM item i
            LEFT JOIN Tax t2 ON i.TaxID = t2.ID
            WHERE i.TaxID IS NOT NULL 
            GROUP BY t2.Percentage 
            ORDER BY t2.percentage
        """, conn)
        return {"vat_rates": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch VAT rates: {str(e)}")

