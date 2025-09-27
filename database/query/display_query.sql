
SELECT 
    CAST(Time as DATE) as TransactionDate,
    SUM(Total) - SUM(SalesTax) as TotalExcl,
    SUM(SalesTax) as TotalVAT,
    SUM(Total) as TotalIncl,
    COUNT(*) as TransactionCount
FROM [Transaction]
WHERE Time >= '2025-09-01' AND Time <= '2025-09-30'
GROUP BY CAST(Time as DATE), StoreID
ORDER BY CAST(Time as DATE);