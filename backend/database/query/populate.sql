-- ==========================================
-- 1. Insert Departments
-- ==========================================
INSERT INTO Department (Name, Code, HQID) VALUES
 ('UnAssigned', 'UA001', 1),
 ('AIRTIME', 'AT001', 1),
 ('BAKERY BREADS', 'BB001', 1),
 ('BAKERY CONFECTIONERY', 'BC001', 1),
 ('BUTCHERY', 'BU001', 1),
 ('CIGARETTES', 'CI001', 1),
 ('DELI', 'DE001', 1),
 ('DRINKS', 'DR001', 1),
 ('EMPTIES', 'EM001', 1),
 ('EXPENSE', 'EX001', 1),
 ('FRUIT & VEG', 'FV001', 1),
 ('GROCERIES', 'GR001', 1),
 ('HABA', 'HA001', 1),
 ('KVI', 'KV001', 1),
 ('LIQUOR', 'LI001', 1),
 ('NON-FOODS', 'NF001', 1),
 ('PERISHABLES', 'PE001', 1),
 ('VOUCHERS', 'VO001', 1);

-- ==========================================
-- 2. Insert Items (linked dynamically to departments)
-- ==========================================
INSERT INTO Item (ItemLookupCode, Description, DepartmentID, Price, Cost, Taxable)
SELECT 'UA001-1', 'UnAssigned Item 1', ID, 10.00, 5.00, 1 FROM Department WHERE Name='UnAssigned'
UNION ALL SELECT 'UA001-2', 'UnAssigned Item 2', ID, 15.00, 7.00, 0 FROM Department WHERE Name='UnAssigned'
UNION ALL SELECT 'AT001-1', 'Airtime Voucher', ID, 20.00, 0.00, 0 FROM Department WHERE Name='AIRTIME'
UNION ALL SELECT 'AT001-2', 'Airtime Card', ID, 10.00, 0.00, 0 FROM Department WHERE Name='AIRTIME'
UNION ALL SELECT 'BB001-1', 'Brown Bread', ID, 2.80, 1.80, 1 FROM Department WHERE Name='BAKERY BREADS'
UNION ALL SELECT 'BB001-2', 'White Bread', ID, 2.50, 1.50, 1 FROM Department WHERE Name='BAKERY BREADS'
UNION ALL SELECT 'BC001-1', 'Chocolate Cake', ID, 15.00, 10.00, 1 FROM Department WHERE Name='BAKERY CONFECTIONERY'
UNION ALL SELECT 'BC001-2', 'Croissant', ID, 5.00, 3.00, 0 FROM Department WHERE Name='BAKERY CONFECTIONERY'
UNION ALL SELECT 'BU001-1', 'Beef Steak', ID, 25.00, 15.00, 1 FROM Department WHERE Name='BUTCHERY'
UNION ALL SELECT 'BU001-2', 'Pork Chops', ID, 20.00, 12.00, 1 FROM Department WHERE Name='BUTCHERY'
UNION ALL SELECT 'CI001-1', 'Cigarette Pack', ID, 50.00, 30.00, 1 FROM Department WHERE Name='CIGARETTES'
UNION ALL SELECT 'CI001-2', 'Cigar', ID, 10.00, 5.00, 0 FROM Department WHERE Name='CIGARETTES'
UNION ALL SELECT 'DE001-1', 'Ham Sandwich', ID, 3.50, 2.50, 1 FROM Department WHERE Name='DELI'
UNION ALL SELECT 'DE001-2', 'Cheese Platter', ID, 7.50, 5.00, 1 FROM Department WHERE Name='DELI'
UNION ALL SELECT 'DR001-1', 'Cola 1L', ID, 1.50, 0.80, 0 FROM Department WHERE Name='DRINKS'
UNION ALL SELECT 'DR001-2', 'Orange Juice 1L', ID, 2.00, 1.00, 0 FROM Department WHERE Name='DRINKS'
UNION ALL SELECT 'EM001-1', 'Bottle Deposit', ID, 0.10, 0.10, 0 FROM Department WHERE Name='EMPTIES'
UNION ALL SELECT 'EM001-2', 'Can Deposit', ID, 0.05, 0.05, 0 FROM Department WHERE Name='EMPTIES'
UNION ALL SELECT 'EX001-1', 'Office Supplies', ID, 50.00, 25.00, 1 FROM Department WHERE Name='EXPENSE'
UNION ALL SELECT 'EX001-2', 'Cleaning Supplies', ID, 30.00, 15.00, 1 FROM Department WHERE Name='EXPENSE'
UNION ALL SELECT 'FV001-1', 'Carrot 1kg', ID, 2.00, 1.00, 1 FROM Department WHERE Name='FRUIT & VEG'
UNION ALL SELECT 'FV001-2', 'Potato 1kg', ID, 1.50, 0.70, 1 FROM Department WHERE Name='FRUIT & VEG'
UNION ALL SELECT 'GR001-1', 'Milk 1L', ID, 1.00, 0.50, 1 FROM Department WHERE Name='GROCERIES'
UNION ALL SELECT 'GR001-2', 'Eggs Dozen', ID, 2.50, 1.20, 1 FROM Department WHERE Name='GROCERIES'
UNION ALL SELECT 'HA001-1', 'Shampoo', ID, 5.00, 3.00, 1 FROM Department WHERE Name='HABA'
UNION ALL SELECT 'HA001-2', 'Soap', ID, 2.00, 1.00, 1 FROM Department WHERE Name='HABA'
UNION ALL SELECT 'KV001-1', 'Batteries', ID, 10.00, 5.00, 1 FROM Department WHERE Name='KVI'
UNION ALL SELECT 'KV001-2', 'Charger', ID, 15.00, 7.00, 0 FROM Department WHERE Name='KVI'
UNION ALL SELECT 'LI001-1', 'Red Wine', ID, 100.00, 70.00, 1 FROM Department WHERE Name='LIQUOR'
UNION ALL SELECT 'LI001-2', 'Whiskey', ID, 150.00, 100.00, 1 FROM Department WHERE Name='LIQUOR'
UNION ALL SELECT 'NF001-1', 'Detergent', ID, 5.00, 3.00, 1 FROM Department WHERE Name='NON-FOODS'
UNION ALL SELECT 'NF001-2', 'Toilet Paper', ID, 3.00, 1.50, 1 FROM Department WHERE Name='NON-FOODS'
UNION ALL SELECT 'PE001-1', 'Frozen Chicken', ID, 50.00, 30.00, 1 FROM Department WHERE Name='PERISHABLES'
UNION ALL SELECT 'PE001-2', 'Ice Cream', ID, 20.00, 10.00, 1 FROM Department WHERE Name='PERISHABLES'
UNION ALL SELECT 'VO001-1', 'Gift Voucher', ID, 10.00, 0.00, 0 FROM Department WHERE Name='VOUCHERS'
UNION ALL SELECT 'VO001-2', 'Loyalty Points', ID, 5.00, 0.00, 0 FROM Department WHERE Name='VOUCHERS';

-- ==========================================
-- 3. Insert Transactions (1 Jan 2025 - 31 Dec 2025, 3 per day)
-- ==========================================
DECLARE @d DATE = '2025-01-01';
WHILE @d <= '2025-12-31'
BEGIN
    INSERT INTO [Transaction] (Time) VALUES (@d);
    INSERT INTO [Transaction] (Time) VALUES (@d);
    INSERT INTO [Transaction] (Time) VALUES (@d);
    SET @d = DATEADD(DAY, 1, @d);
END;

-- ==========================================
-- 4. Insert Transaction Entries (dynamic IDs, random quantities)
-- ==========================================
DECLARE @txnID INT;
DECLARE txn_cursor CURSOR FOR
SELECT TransactionNumber FROM [Transaction];

OPEN txn_cursor;
FETCH NEXT FROM txn_cursor INTO @txnID;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- For each department, pick one item and insert a sale
    INSERT INTO TransactionEntry (TransactionNumber, ItemID, Quantity, Price, SalesTax)
    SELECT @txnID, ID, FLOOR(RAND()*10)+1, Price, FLOOR(RAND()*5)
    FROM Item;

    FETCH NEXT FROM txn_cursor INTO @txnID;
END

CLOSE txn_cursor;
DEALLOCATE txn_cursor;

-- ==========================================
-- 5. Insert opening stock for each item (for StockOnHandCost)
-- ==========================================
INSERT INTO IX_ITEMOPENINGSTOCK (Lookupcode, Description, DepartmentID, Quantity, Cost, Price, Valuedate)
SELECT 
    ItemLookupCode, 
    Description, 
    DepartmentID, 
    100, 
    Cost, 
    Price, 
    GETDATE()
FROM Item;