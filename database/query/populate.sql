-- ========================================
-- Populate Store, Tax, Item, Transaction, TransactionEntry
-- ========================================

-- ========== STORE ==========
INSERT INTO Store (Name, StoreCode)
VALUES 
('Central Market', 'CM001'),
('East Side Store', 'ES002'),
('West Town Store', 'WT003'),
('North Point', 'NP004'),
('South Plaza', 'SP005'),
('Downtown Hub', 'DH006'),
('Uptown Center', 'UC007'),
('Riverside Shop', 'RS008'),
('Lakeside Mart', 'LM009'),
('Hilltop Store', 'HT010');

-- ========== TAX ==========
INSERT INTO Tax (Percentage)
VALUES
(0),
(5),
(10),
(12),
(15),
(16),
(18),
(20),
(25),
(30);

-- ========== ITEM ==========
INSERT INTO Item (Description, Price, TaxID, Quantity, HQID, Cost, ItemType, SerialNumberCount, TareWeight, TareWeightPercent)
VALUES
('Apple', 1.2, 2, 100, 1, 0.8, 1, 0, 0, 0),
('Banana', 0.8, 2, 150, 2, 0.5, 1, 0, 0, 0),
('Milk', 1.5, 5, 50, 3, 1.0, 1, 0, 0, 0),
('Bread', 2.0, 5, 75, 4, 1.2, 1, 0, 0, 0),
('Soap', 3.0, 10, 200, 5, 2.0, 1, 0, 0, 0),
('Shampoo', 5.0, 10, 120, 6, 3.0, 1, 0, 0, 0),
('Rice', 10.0, 12, 300, 7, 7.0, 1, 0, 0, 0),
('Sugar', 4.0, 12, 250, 8, 2.5, 1, 0, 0, 0),
('Eggs', 0.2, 2, 500, 9, 0.1, 1, 0, 0, 0),
('Butter', 1.8, 5, 100, 10, 1.0, 1, 0, 0, 0);

-- ========== TRANSACTION ==========
INSERT INTO [Transaction] (Time, StoreID, BatchNumber, Total)
VALUES
('2025-09-01 10:00', 1, 101, 120.0),
('2025-09-01 11:00', 2, 102, 80.0),
('2025-09-02 09:30', 3, 103, 150.0),
('2025-09-02 14:00', 4, 104, 200.0),
('2025-09-03 16:45', 5, 105, 300.0),
('2025-09-04 12:15', 6, 106, 180.0),
('2025-09-05 10:50', 7, 107, 250.0),
('2025-09-05 15:30', 8, 108, 220.0),
('2025-09-06 09:00', 9, 109, 100.0),
('2025-09-06 11:25', 10, 110, 130.0);

-- ========== TRANSACTION ENTRY ==========
INSERT INTO TransactionEntry (TransactionNumber, ItemID, StoreID, Price, Quantity, SalesTax)
VALUES
(1, 1, 1, 1.2, 10, 0.06),
(2, 2, 2, 0.8, 20, 0.08),
(3, 3, 3, 1.5, 15, 0.15),
(4, 4, 4, 2.0, 10, 0.20),
(5, 5, 5, 3.0, 25, 0.30),
(6, 6, 6, 5.0, 12, 0.50),
(7, 7, 7, 10.0, 20, 2.40),
(8, 8, 8, 4.0, 15, 0.60),
(9, 9, 9, 0.2, 50, 0.20),
(10, 10, 10, 1.8, 20, 0.36);