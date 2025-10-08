-- Disable foreign key checks temporarily (if needed)
ALTER TABLE TransactionEntry NOCHECK CONSTRAINT ALL;
ALTER TABLE [Transaction] NOCHECK CONSTRAINT ALL;

-- Delete dependent tables first
DELETE FROM TransactionEntry;
DELETE FROM [Transaction];

-- Delete parent tables
DELETE FROM Store;
DELETE FROM Item;
DELETE FROM Tax;

-- Re-enable constraints
ALTER TABLE TransactionEntry CHECK CONSTRAINT ALL;
ALTER TABLE [Transaction] CHECK CONSTRAINT ALL;

-- Optional: reset identity counters
DBCC CHECKIDENT ('TransactionEntry', RESEED, 0);
DBCC CHECKIDENT ('[Transaction]', RESEED, 0);
DBCC CHECKIDENT ('Item', RESEED, 0);
DBCC CHECKIDENT ('Tax', RESEED, 0);