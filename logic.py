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

@router.post("/connect-db")
async def connect_db(conn: DBConnection):
    global db_instance
    try:
        db_instance = Database(conn.server, conn.database, conn.username, conn.password)
        db_instance.connect()
        return {"message": "Connection to the Database successfull"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/vat-return")
async def vat_report(
    start_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    end_date: str = Query(..., description="Format: YYYY-MM-DD"), 
    store_id: int = Query(None, description="Optional: Filter by specicifc order")
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
                t.id,
                t.Store_ID,
                t.Terminal,
                t.Transaction_number,
                t.TransactionDate,
                t.Item_Code,
                t.Description,
                t.Quanity,
                t.Price,
                t.Total_Excl,
                t.VAT_Amount,
                t.Total_Incl,
                t.Discount_Amount,
                s.Name as StoreName,
                i.vatrate as ItemVATRate
                FROM Transaction t
                LEFT JOIN Store s ON t.Store_ID = s.ID
                LEFT JOIN item i ON t.Item_Code = i.itemCode
                WHERE t.transactionDate >= ? AND t.transactionDate <= ?       
    """

    params =  [start_date, end_date]

    if store_id:
        base_query += " AND t.Store_ID = ?"
        params.append(str(store_id))
    
    base_query += "ORDER BY t.transactionDate, t.Transaction_Number"

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
    store_breakdown = df.groupby(['Store_ID', 'StoreName']).agg({
        'Total_Excl': 'sum',
        'VAT_Amount': 'sum',
        'Total_Incl': 'sum'
    }).reset_index()

    store_breakdown_list = []
    for _, row in store_breakdown.iterrows():
        store_breakdown_list.append({
            "store_id": int(row['Store_ID']),
            "store_name": row['StoreName'] if pd.notna(row['StoreName']) else f"Store {row['Store_ID']}",
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
    store_id: int = Query(None, description="Optional: Filter by specific store")
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
            SummaryDate,
            GrossSales,
            TaxableSales,
            NonTaxableSales,
            TaxAmount,
            Discounts
        FROM Daily_Summary
        WHERE SummaryDate >= ? AND SummaryDate <= ?
        ORDER BY SummaryDate 
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
                CAST(transactionDate as DATE) as TransactionDate,
                SUM(Total_Excl) as TotalExcl,
                SUM(VAT_Amount) as TotalVAT,
                SUM(Total_Incl) as TotalIncl,
                SUM(Discount_Amount) as TotalDiscounts,
                COUNT(*) as TransactionCount
            FROM Transaction
            WHERE transactionDate >= ? AND transactionDate <= ?
        """
    
    params = [start_date, end_date]
    if store_id:
        transaction_query += " AND Store_ID = ?"
        params.append(str(store_id))
    
    transaction_query += " GROUP BY CAST(transactionDate as DATE) ORDER BY TransactionDate"
    
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
                "total_discounts": round(df['TotalDiscounts'].sum(), 2),
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
        df = pd.read_sql("SELECT ID, Name, BranchNumber, TaxCode FROM Store ORDER BY Name", conn)
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
            SELECT DISTINCT vatrate as vat_rate, COUNT(*) as item_count 
            FROM item 
            WHERE vatrate IS NOT NULL 
            GROUP BY vatrate 
            ORDER BY vatrate
        """, conn)
        return {"vat_rates": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch VAT rates: {str(e)}")

