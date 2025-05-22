<?php
// sales.php - Handles Sales data operations with stock validation

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (session_status() == PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => isset($_SERVER['HTTPS']),
        'cookie_samesite' => 'Lax'
    ]);
}

require_once 'database.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    error_log("Sales.php received GET request");
    try {
        $stmt = $pdo->query("
            SELECT
                si.SalesItemID,
                s.InvoiceNo,
                s.SalesDate,
                p.Barcode,
                p.ProductName,
                si.QuantitySold,
                pp.UnitPrice,
                (si.QuantitySold * pp.UnitPrice) AS TotalItemPrice,
                c.CustomerName,
                s.PaymentStatus,
                a.Username AS AccountUsername
            FROM
                salesitem si
            JOIN
                sales s ON si.InvoiceNo = s.InvoiceNo
            JOIN
                product p ON si.ProductID = p.ProductID
            JOIN
                productprice pp ON p.ProductID = pp.ProductID
            LEFT JOIN
                customer c ON s.CustomerID = c.CustomerID
            JOIN
                account a ON s.AccountID = a.AccountID
            ORDER BY
                s.SalesDate DESC, s.InvoiceNo DESC, si.SalesItemID ASC
        ");
        $salesItems = $stmt->fetchAll();

        $formattedSales = array_map(function($item) {
            return [
                'id' => $item['SalesItemID'],
                'invoiceNo' => $item['InvoiceNo'],
                'date' => $item['SalesDate'],
                'barcode' => $item['Barcode'],
                'product' => $item['ProductName'],
                'quantity' => (int)$item['QuantitySold'],
                'unitPrice' => (float)$item['UnitPrice'],
                'total' => (float)$item['TotalItemPrice'],
                'customer' => $item['CustomerName'],
                'status' => $item['PaymentStatus'],
            ];
        }, $salesItems);

        error_log("Successfully fetched sales data, returning " . count($formattedSales) . " items.");
        echo json_encode(['success' => true, 'sales' => $formattedSales]);

    } catch (PDOException $e) {
        error_log("Sales GET PDOException: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    } catch (Exception $e) {
        error_log("Sales GET Exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'An unexpected error occurred: ' . $e->getMessage()]);
    }

} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    error_log("Sales.php received POST request");
    $input = json_decode(file_get_contents("php://input"), true); // *** THIS IS THE CRITICAL CHANGE ***

    $accountID = $input['accountId'] ?? '';
    $salesDate = $input['date'] ?? '';
    $customerName = $input['customer'] ?? null;
    $paymentStatus = $input['status'] ?? 'Paid';
    $products = $input['products'] ?? []; // Array of products from frontend

    // Validate input
    if (empty($accountID) || empty($salesDate) || empty($products)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields (Account ID, Date, or Products).']);
        exit();
    }

    if (!is_array($products) || count($products) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No products provided for the sale.']);
        exit();
    }

    try {
        // Start transaction
        $pdo->beginTransaction();

        // Validate AccountID
        $stmt = $pdo->prepare("SELECT AccountID FROM account WHERE AccountID = :accountID");
        $stmt->bindParam(':accountID', $accountID, PDO::PARAM_INT);
        $stmt->execute();
        if (!$stmt->fetch()) {
            error_log("Sales POST Validation failed: Invalid AccountID " . $accountID);
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid Account ID.']);
            $pdo->rollBack();
            exit();
        }

        // Get or create CustomerID
        $customerID = null;
        if (!empty($customerName)) {
            $stmt = $pdo->prepare("SELECT CustomerID FROM customer WHERE CustomerName = :customerName");
            $stmt->bindParam(':customerName', $customerName);
            $stmt->execute();
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($customer) {
                $customerID = $customer['CustomerID'];
            } else {
                $stmt = $pdo->prepare("INSERT INTO customer (CustomerName) VALUES (:customerName)");
                $stmt->bindParam(':customerName', $customerName);
                $stmt->execute();
                $customerID = $pdo->lastInsertId();
            }
        }

        // Insert into sales table
        $stmt = $pdo->prepare("INSERT INTO sales (AccountID, SalesDate, CustomerID, PaymentStatus) VALUES (:accountID, :salesDate, :customerID, :paymentStatus)");
        $stmt->bindParam(':accountID', $accountID, PDO::PARAM_INT);
        $stmt->bindParam(':salesDate', $salesDate);
        $stmt->bindParam(':customerID', $customerID, PDO::PARAM_INT);
        $stmt->bindParam(':paymentStatus', $paymentStatus);
        $stmt->execute();
        $invoiceNo = $pdo->lastInsertId();
        error_log("Sales record inserted with InvoiceNo: " . $invoiceNo);

        // Process each product in the sale
        foreach ($products as $productData) {
            $barcode = $productData['barcode'] ?? '';
            $quantitySold = (int)($productData['quantity'] ?? 0);

            if (empty($barcode) || $quantitySold <= 0) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid product data (barcode or quantity missing/invalid).']);
                exit();
            }

            // Get ProductID and UnitPrice
            $stmt = $pdo->prepare("
                SELECT p.ProductID, pp.UnitPrice
                FROM product p
                JOIN productprice pp ON p.ProductID = pp.ProductID
                WHERE p.Barcode = :barcode
            ");
            $stmt->bindParam(':barcode', $barcode);
            $stmt->execute();
            $productInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$productInfo) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => "Product with barcode '$barcode' not found."]);
                exit();
            }

            $productID = $productInfo['ProductID'];
            $unitPrice = $productInfo['UnitPrice'];

            // Calculate current stock for the product
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(s.StockQuantity), 0) - COALESCE(SUM(si.QuantitySold), 0) AS current_stock
                FROM product p
                LEFT JOIN stocks s ON p.ProductID = s.ProductID
                LEFT JOIN salesitem si ON p.ProductID = si.ProductID
                WHERE p.ProductID = :productID
            ");
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->execute();
            $currentStock = $stmt->fetchColumn();

            if ($currentStock < $quantitySold) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => "Insufficient stock for product '$barcode'. Available: " . $currentStock . ", Requested: " . $quantitySold]);
                exit();
            }

            // Insert into salesitem table
            $stmt = $pdo->prepare("INSERT INTO salesitem (InvoiceNo, ProductID, QuantitySold) VALUES (:invoiceNo, :productID, :quantitySold)");
            $stmt->bindParam(':invoiceNo', $invoiceNo, PDO::PARAM_INT);
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->bindParam(':quantitySold', $quantitySold, PDO::PARAM_INT);
            $stmt->execute();
            error_log("SalesItem record inserted for ProductID: " . $productID . " with QuantitySold: " . $quantitySold);

        }

        // Commit transaction
        $pdo->commit();
        error_log("Transaction committed successfully for InvoiceNo: " . $invoiceNo);
        echo json_encode(['success' => true, 'message' => 'Sale added successfully!']);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Sales POST PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to add sale: ' . $e->getMessage()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Sales POST Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An unexpected error occurred: ' . $e->getMessage()]);
    }

} elseif ($_SERVER["REQUEST_METHOD"] == "PUT") {
    error_log("Sales.php received PUT request");
    $input = json_decode(file_get_contents("php://input"), true);

    $invoiceNo = $input['invoiceNo'] ?? '';
    $status = $input['status'] ?? '';

    if (empty($invoiceNo) || empty($status)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing Invoice Number or Status.']);
        exit();
    }

    try {
        error_log("Sales PUT Updating status for InvoiceNo: " . $invoiceNo . " to status: " . $status);
        $stmt = $pdo->prepare("UPDATE sales SET PaymentStatus = :status WHERE InvoiceNo = :invoiceNo");
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':invoiceNo', $invoiceNo, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            error_log("Sales PUT Status updated successfully for InvoiceNo: " . $invoiceNo);
            echo json_encode(['success' => true, 'message' => 'Sales payment status updated successfully!']);
        } else {
            error_log("Sales PUT Invoice not found for status update: " . $invoiceNo);
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Sales invoice not found for status update.']);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Sales PUT PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to update sales status: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Sales PUT Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An unexpected error occurred during status update: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>