<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$servername = "localhost";
$username = "root"; 
$password = ""; 
$dbname = "mk_inventory_ledger";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get filter parameter from request
$filter = $_GET['filter'] ?? 'All';
$startDate = null;
$endDate = null;
$prevStartDate = null;
$prevEndDate = null;

// Calculate date range and previous period date range based on filter
switch ($filter) {
    case 'This Week':
        // Calculate Monday of the current week
        $startDate = date('Y-m-d', strtotime('monday this week'));
        // Calculate Sunday of the current week
        $endDate = date('Y-m-d', strtotime('sunday this week'));

        // Calculate previous week's Monday and Sunday
        $prevStartDate = date('Y-m-d', strtotime('monday last week'));
        $prevEndDate = date('Y-m-d', strtotime('sunday last week'));
        break;
    case 'This Month':
        $startDate = date('Y-m-01'); // Start of the current month
        $endDate = date('Y-m-d'); // Today
        $prevMonth = date('Y-m', strtotime('-1 month'));
        $prevStartDate = date('Y-m-01', strtotime($prevMonth)); // Start of the previous month
        $prevEndDate = date('Y-m-t', strtotime($prevMonth)); // End of the previous month
        break;
    case 'This Year':
        $startDate = date('Y-01-01'); // Start of the current year
        $endDate = date('Y-m-d'); // Today
        $prevYear = date('Y', strtotime('-1 year'));
        $prevStartDate = date($prevYear . '-01-01'); // Start of the previous year
        $prevEndDate = date($prevYear . '-12-31'); // End of the previous year
        break;
    case 'All':
    default:
        // No date filtering needed for current period, no previous period for comparison
        $startDate = null;
        $endDate = null;
        $prevStartDate = null;
        $prevEndDate = null;
        break;
}

try {
    // Key Metrics Queries (Filtered by Date)

    // Get total sales amount for Paid transactions only for the current period
    $sqlTotalSales = "SELECT COALESCE(SUM(si.QuantitySold * pp.UnitPrice), 0) as totalSales
            FROM salesitem si
            JOIN productprice pp ON si.ProductID = pp.ProductID
            JOIN sales s ON si.InvoiceNo = s.InvoiceNo
            WHERE s.PaymentStatus = 'Paid'";

    if ($startDate && $endDate) {
        $sqlTotalSales .= " AND s.SalesDate BETWEEN '$startDate' AND '$endDate'";
    }

    $resultTotalSales = $conn->query($sqlTotalSales);
    $totalSales = $resultTotalSales->fetch_assoc()['totalSales'];

    // Get total orders count for the current period
    $sqlTotalOrders = "SELECT COALESCE(COUNT(*), 0) as totalOrders FROM sales";
    if ($startDate && $endDate) {
        $sqlTotalOrders .= " WHERE SalesDate BETWEEN '$startDate' AND '$endDate'";
    }
    $resultTotalOrders = $conn->query($sqlTotalOrders);
    $totalOrders = $resultTotalOrders->fetch_assoc()['totalOrders'];

    // Get pending orders count (should NOT be affected by time filter, always current)
    $sqlPendingOrders = "SELECT COALESCE(COUNT(*), 0) as pendingOrders FROM sales WHERE PaymentStatus != 'Paid'";
    $resultPendingOrders = $conn->query($sqlPendingOrders);
    $pendingOrders = $resultPendingOrders->fetch_assoc()['pendingOrders'];

    // Previous Period Data for Percentage Changes
    $prevTotalSales = 0;
    $prevTotalOrders = 0;
    // prevPendingOrders is not relevant if pendingOrders is always current
    $prevPendingOrders = 0; // Initialize but won't be used for calculation

    if ($prevStartDate && $prevEndDate) {
        // Get previous total sales amount for Paid transactions only
        $sqlPrevTotalSales = "SELECT COALESCE(SUM(si.QuantitySold * pp.UnitPrice), 0) as prevTotalSales
                FROM salesitem si
                JOIN productprice pp ON si.ProductID = pp.ProductID
                JOIN sales s ON si.InvoiceNo = s.InvoiceNo
                WHERE s.PaymentStatus = 'Paid' AND s.SalesDate BETWEEN '$prevStartDate' AND '$prevEndDate'";
        $resultPrevTotalSales = $conn->query($sqlPrevTotalSales);
        $prevTotalSales = $resultPrevTotalSales->fetch_assoc()['prevTotalSales'];

        // Get previous total orders count
        $sqlPrevTotalOrders = "SELECT COALESCE(COUNT(*), 0) as prevTotalOrders FROM sales WHERE SalesDate BETWEEN '$prevStartDate' AND '$prevEndDate'";
        $resultPrevTotalOrders = $conn->query($sqlPrevTotalOrders);
        $prevTotalOrders = $resultPrevTotalOrders->fetch_assoc()['prevTotalOrders'];
    }

    // Calculate percentage changes
    $salesChange = ($prevTotalSales > 0) ? (($totalSales - $prevTotalSales) / $prevTotalSales) * 100 : ($totalSales > 0 ? 100 : 0);
    $ordersChange = ($prevTotalOrders > 0) ? (($totalOrders - $prevTotalOrders) / $prevTotalOrders) * 100 : ($totalOrders > 0 ? 100 : 0);
    // pendingChange is always 0 as per requirement to not be affected by filter
    $pendingChange = 0;

    echo json_encode([
        "totalSales" => (float)$totalSales,
        "totalOrders" => (int)$totalOrders,
        "pendingOrders" => (int)$pendingOrders,
        "percentChanges" => [
            "totalSales" => (float)$salesChange,
            "totalOrders" => (float)$ordersChange,
            "pendingOrders" => (float)$pendingChange
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>