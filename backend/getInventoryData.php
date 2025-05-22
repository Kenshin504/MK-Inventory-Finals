<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mk_inventory_ledger";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$filter = $_GET['filter'] ?? 'All';
$startDate = null;
$endDate = null;

// Calculate date range based on filter
switch ($filter) {
    case 'This Week':
        $startDate = date('Y-m-d', strtotime('monday this week'));
        $endDate = date('Y-m-d', strtotime('sunday this week'));
        break;
    case 'This Month':
        $startDate = date('Y-m-01');
        $endDate = date('Y-m-d');
        break;
    case 'This Year':
        $startDate = date('Y-01-01');
        $endDate = date('Y-m-d');
        break;
    case 'All':
    default:
        $startDate = '1900-01-01';
        $endDate = date('Y-m-d');
        break;
}

try {
    // FIXED: Current Inventory Metrics with non-negative stock
    $sqlCurrentStock = "SELECT
                        p.ProductID,
                        p.ProductName,
                        COALESCE(ts.TotalStocked, 0) as TotalStocked,
                        COALESCE(tsi.TotalSold, 0) as TotalSold,
                        GREATEST(COALESCE(ts.TotalStocked, 0) - COALESCE(tsi.TotalSold, 0), 0) as current_stock
                    FROM product p
                    LEFT JOIN (
                        SELECT ProductID, SUM(StockQuantity) AS TotalStocked
                        FROM stocks
                        GROUP BY ProductID
                    ) ts ON p.ProductID = ts.ProductID
                    LEFT JOIN (
                        SELECT ProductID, SUM(QuantitySold) AS TotalSold
                        FROM salesitem
                        GROUP BY ProductID
                    ) tsi ON p.ProductID = tsi.ProductID
                    ORDER BY current_stock ASC";

    $resultCurrentStock = $conn->query($sqlCurrentStock);

    $outOfStockCount = 0;
    $lowStockCount = 0;
    $currentStockPerProduct = [];
    $debugProductStocks = [];

    if ($resultCurrentStock) {
        while ($row = $resultCurrentStock->fetch_assoc()) {
            $stock = (int)$row['current_stock'];
            $productId = $row['ProductID'];
            $productName = $row['ProductName'];

            if ($stock <= 0) {
                $outOfStockCount++;
            } else if ($stock < 30) {
                $lowStockCount++;
            }

            $currentStockPerProduct[] = [
                "name" => $productName,
                "current_stock" => $stock
            ];

            $debugProductStocks[] = [
                'ProductID' => $productId,
                'ProductName' => $productName,
                'TotalStocked' => (int)$row['TotalStocked'],
                'TotalSold' => (int)$row['TotalSold'],
                'current_stock' => $stock,
                'status' => ($stock <= 0) ? 'Out of Stock' : (($stock < 30) ? 'Low Stock' : 'Fully Stocked')
            ];
        }
    }

    // Total Stock Cost
    $sqlTotalStockCost = "SELECT COALESCE(SUM(StockQuantity * UnitCost), 0) as totalStockCost FROM stocks";
    $resultTotalStockCost = $conn->query($sqlTotalStockCost);
    $totalStockCost = $resultTotalStockCost->fetch_assoc()['totalStockCost'] ?? 0;

    // Time-Filtered Metrics
    $sqlTotalStockExpenses = "SELECT COALESCE(SUM(StockQuantity * UnitCost), 0) as totalStockExpenses
                             FROM stocks
                             WHERE DateStocked BETWEEN '$startDate' AND '$endDate'";
    $resultTotalStockExpenses = $conn->query($sqlTotalStockExpenses);
    $totalStockExpenses = $resultTotalStockExpenses->fetch_assoc()['totalStockExpenses'] ?? 0;

    $sqlTotalRestockRecord = "SELECT COALESCE(COUNT(*), 0) as totalRestockRecord
                             FROM stocks
                             WHERE DateStocked BETWEEN '$startDate' AND '$endDate'";
    $resultTotalRestockRecord = $conn->query($sqlTotalRestockRecord);
    $totalRestockRecord = $resultTotalRestockRecord->fetch_assoc()['totalRestockRecord'] ?? 0;

    // Category Sales Data for Pie Chart
    $sqlCategorySales = "SELECT
                        pc.CategoryName as name,
                        COALESCE(SUM(si.QuantitySold), 0) as quantity_sold
                    FROM salesitem si
                    JOIN sales s ON si.InvoiceNo = s.InvoiceNo
                    JOIN product p ON si.ProductID = p.ProductID
                    JOIN productcategory pc ON p.ProdCategoryID = pc.ProdCategoryID
                    WHERE s.PaymentStatus = 'Paid'
                    AND s.SalesDate BETWEEN '$startDate' AND '$endDate'
                    GROUP BY pc.CategoryName
                    ORDER BY quantity_sold DESC";

    $resultCategorySales = $conn->query($sqlCategorySales);
    $categorySalesData = [];
    while ($row = $resultCategorySales->fetch_assoc()) {
        $categorySalesData[] = [
            "name" => $row['name'],
            "quantity_sold" => (int)$row['quantity_sold']
        ];
    }

    // Product Sales Data for Bar Chart (Top 10 Products)
    $sqlProductSales = "SELECT
                        p.ProductName as name,
                        COALESCE(SUM(si.QuantitySold), 0) as quantity_sold
                    FROM salesitem si
                    JOIN sales s ON si.InvoiceNo = s.InvoiceNo
                    JOIN product p ON si.ProductID = p.ProductID
                    WHERE s.PaymentStatus = 'Paid'
                    AND s.SalesDate BETWEEN '$startDate' AND '$endDate'
                    GROUP BY p.ProductName
                    ORDER BY quantity_sold DESC
                    LIMIT 10";

    $resultProductSales = $conn->query($sqlProductSales);
    $productSalesData = [];
    while ($row = $resultProductSales->fetch_assoc()) {
        $productSalesData[] = [
            "name" => $row['name'],
            "quantity_sold" => (int)$row['quantity_sold']
        ];
    }

    // Total Sales Over Time
    $salesTimeAggregateFormat = '%Y-%m';
    if ($filter === 'This Week') {
        $salesTimeAggregateFormat = '%Y-%m-%d';
    } elseif ($filter === 'This Month') {
        $salesTimeAggregateFormat = '%Y-%u';
    }

    $sqlTotalSalesOverTime = "SELECT
                             DATE_FORMAT(s.SalesDate, '$salesTimeAggregateFormat') as period,
                             COALESCE(SUM(si.QuantitySold * pp.UnitPrice), 0) as totalSalesAmount
                         FROM sales s
                         JOIN salesitem si ON s.InvoiceNo = si.InvoiceNo
                         JOIN productprice pp ON si.ProductID = pp.ProductID
                         WHERE s.PaymentStatus = 'Paid'
                         AND s.SalesDate BETWEEN '$startDate' AND '$endDate'
                         GROUP BY period
                         ORDER BY period ASC";

    $resultTotalSalesOverTime = $conn->query($sqlTotalSalesOverTime);
    $totalSalesOverTime = [];
    while ($row = $resultTotalSalesOverTime->fetch_assoc()) {
        $totalSalesOverTime[] = [
            "period" => $row['period'],
            "totalSalesAmount" => (float)$row['totalSalesAmount']
        ];
    }

    // Net Stock Change
    $timeAggregateFormat = '%Y-%m-%d';
    if ($filter === 'This Year' || $filter === 'All') {
        $timeAggregateFormat = '%Y-%m';
    }

    $sqlNetChange = "SELECT period, SUM(stocked) as totalStocked, SUM(sold) as totalSold
                    FROM (
                        (SELECT
                            DATE_FORMAT(DateStocked, '$timeAggregateFormat') as period,
                            SUM(StockQuantity) as stocked,
                            0 as sold
                        FROM stocks
                        WHERE DateStocked BETWEEN '$startDate' AND '$endDate'
                        GROUP BY period)
                        
                        UNION ALL
                        
                        (SELECT
                            DATE_FORMAT(s.SalesDate, '$timeAggregateFormat') as period,
                            0 as stocked,
                            SUM(si.QuantitySold) as sold
                        FROM sales s
                        JOIN salesitem si ON s.InvoiceNo = si.InvoiceNo
                        WHERE s.PaymentStatus = 'Paid'
                        AND s.SalesDate BETWEEN '$startDate' AND '$endDate'
                        GROUP BY period)
                    ) as movements
                    GROUP BY period
                    ORDER BY period ASC";

    $resultNetChange = $conn->query($sqlNetChange);
    $netStockChangeOverTime = [];
    while ($row = $resultNetChange->fetch_assoc()) {
        $netStockChangeOverTime[] = [
            "period" => $row['period'],
            "net_change" => (int)($row['totalStocked'] - $row['totalSold'])
        ];
    }

    echo json_encode([
        "inventoryMetrics" => [
            "lowStockItems" => $lowStockCount,
            "outOfStockItems" => $outOfStockCount,
            "totalStockCost" => (float)$totalStockCost
        ],
        "totalStockExpenses" => (float)$totalStockExpenses,
        "totalRestockRecord" => (int)$totalRestockRecord,
        "totalQuantitySoldByCategory" => $categorySalesData,
        "totalQuantitySoldByProduct" => $productSalesData,
        "netStockChangeOverTime" => $netStockChangeOverTime,
        "totalSalesOverTime" => $totalSalesOverTime,
        "currentStockPerProduct" => $currentStockPerProduct,
        "debugInfo" => [
            "filter" => $filter,
            "date_range" => ["start" => $startDate, "end" => $endDate],
            "product_stocks_details" => $debugProductStocks,
            "sql_fixes" => [
                "negative_stock_fix" => "GREATEST() function used to prevent negative stock values",
                "bar_chart_fix" => "Added separate query for top 10 products"
            ]
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>