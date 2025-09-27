SELECT
    t.TransactionNumber AS TransactionID,
    t.Time AS TransactionTime,
    t.BatchNumber,
    t.Total AS TransactionTotal,
    
    s.StoreCode AS StoreCode,
    s.Name AS StoreName,
    
    te.TransactionNumber AS TransactionEntryID,
    te.ItemID,
    i.Description AS ItemDescription,
    i.Price AS ItemPrice,
    i.Cost AS ItemCost,
    i.TaxID,
    tx.Percentage AS TaxPercentage,
    te.Quantity AS QuantitySold,
    te.Price AS SoldPrice,
    te.SalesTax AS SalesTaxAmount

FROM [Transaction] t
INNER JOIN Store s ON t.StoreID = s.ID -- replace 'ID' with the actual PK of Store
INNER JOIN TransactionEntry te ON te.TransactionNumber = t.TransactionNumber
INNER JOIN Item i ON te.ItemID = i.ID
INNER JOIN Tax tx ON i.TaxID = tx.ID

ORDER BY t.TransactionNumber, te.ItemID;