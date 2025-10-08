import random
from datetime import datetime, timedelta
import pyodbc

# --- Database connection ---
server = "mssql2022"   # Change if needed
database = "CHOMA"
username = "SA"
password = "Black99raiser%*"

conn = pyodbc.connect(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={server};DATABASE={database};UID={username};PWD={password}"
)
cursor = conn.cursor()

# --- Insert VAT rates ---
vat_rates = [0, 16]  # Non-taxable and standard VAT
tax_ids = {}

for rate in vat_rates:
    cursor.execute("INSERT INTO Tax (Percentage) OUTPUT INSERTED.ID VALUES (?)", (rate,))
    result = cursor.fetchone()
    if result is not None:
        tax_ids[rate] = result[0]
    else:
        raise Exception(f"Failed to insert VAT rate {rate}")
print("Inserted VAT rates:", tax_ids)

# --- Insert Stores (company style) ---
store_names = [
    ("Choma SuperMart", "CHM001"),
    ("Lusaka Grocery Hub", "LSK002"),
    ("Kitwe Wholesale Center", "KTW003"),
]
store_ids = []

for name, code in store_names:
    cursor.execute(
        "INSERT INTO Store (Name, StoreCode) OUTPUT INSERTED.ID VALUES (?, ?)", 
        (name, code)
    )
    result = cursor.fetchone()
    if result is not None:
        store_ids.append(result[0])
    else:
        raise Exception(f"Failed to insert store {name}")
print(f"Inserted {len(store_ids)} stores.")

# --- Insert Items (realistic) ---
item_data = [
    ("Maize Meal 25kg", 120.0, 16),
    ("Cooking Oil 2L", 65.0, 16),
    ("Sugar 1kg", 25.0, 16),
    ("Fresh Milk 500ml", 10.0, 16),
    ("Bread Loaf", 15.0, 0),
    ("Soap Bar", 12.0, 16),
    ("Salt 1kg", 8.0, 0),
]
items = []

for name, price, vat in item_data:
    cursor.execute(
        "INSERT INTO Item (Description, Price, TaxID) OUTPUT INSERTED.ID VALUES (?, ?, ?)",
        (name, price, tax_ids[vat]),
    )
    result = cursor.fetchone()
    if result is not None:
        items.append((result[0], price, vat))
    else:
        raise Exception(f"Failed to insert item {name}")
print(f"Inserted {len(items)} items.")

# --- Generate Transactions for 3 months ---
start_date = datetime.now() - timedelta(days=90)
transaction_number = 1

for day in range(90):
    current_date = start_date + timedelta(days=day)
    for store_id in store_ids:
        for _ in range(random.randint(10, 20)):  # 10–20 transactions per store per day
            batch_number = random.randint(1000, 9999)
            cursor.execute(
                "INSERT INTO [Transaction] (Time, BatchNumber, StoreID, Total, SalesTax) "
                "OUTPUT INSERTED.TransactionNumber VALUES (?, ?, ?, ?, ?)",
                (current_date, batch_number, store_id, 0, 0),
            )
            txn_result = cursor.fetchone()
            if txn_result is None:
                raise Exception(f"Failed to insert transaction {transaction_number}")

            total, tax = 0, 0
            for _ in range(random.randint(1, 5)):  # 1–5 items per transaction
                item_id, price, vat = random.choice(items)
                qty = random.randint(1, 3)
                sales_tax = round((price * qty * vat) / 100, 2)
                line_total = round(price * qty + sales_tax, 2)

                cursor.execute(
                    "INSERT INTO TransactionEntry (TransactionNumber, ItemID, Quantity, Price, SalesTax, StoreID) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (transaction_number, item_id, qty, price, sales_tax, store_id),
                )

                total += line_total
                tax += sales_tax

            # Update transaction totals
            cursor.execute(
                "UPDATE [Transaction] SET Total=?, SalesTax=? WHERE TransactionNumber=?",
                (total, tax, transaction_number),
            )
            conn.commit()
            transaction_number += 1

print("✅ Demo data population complete!")

cursor.close()
conn.close()