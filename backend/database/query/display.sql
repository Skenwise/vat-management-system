WITH DepartmentSales AS (
    SELECT 
        d.Name AS DepartmentName,
        SUM(te.Quantity * te.Price) AS SalesExclusive,
        SUM(te.SalesTax) AS SalesTax
    FROM TransactionEntry te
    JOIN Item i ON i.ID = te.ItemID
    JOIN Department d ON d.ID = i.DepartmentID
    JOIN [Transaction] t ON t.TransactionNumber = te.TransactionNumber
    GROUP BY d.ID, d.Name
)
SELECT *
FROM (
    -- Totals row
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

    -- Department rows
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