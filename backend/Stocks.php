<?php
// Stocks.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

// Helper function to determine stock status based on quantity
function getStockStatus($quantity) {
    $qty = (int)$quantity;
    if ($qty <= 0) return "Out of Stock";
    if ($qty < 30) return "Low on Stock";
    return "Fully Stocked";
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Determine if fetching Stock List or Stock History based on a potential query parameter
    $type = $_GET['type'] ?? 'list'; // Default to 'list'

     error_log("Stocks.php received GET request with type: " . $type);


    try {
        if ($type === 'history') {
            // Fetch Stock History (individual stock entries)
             error_log("Fetching stock history");
            $stmt = $pdo->query("
                SELECT
                    s.StockID,
                    s.DateStocked,
                    p.Barcode,
                    p.ProductName, -- Added ProductName
                    sup.SupplierName,
                    s.StockQuantity,
                    s.UnitCost,
                    (s.StockQuantity * s.UnitCost) AS TotalCost -- Calculate total cost
                FROM
                    stocks s
                JOIN
                    product p ON s.ProductID = p.ProductID
                JOIN
                    supplier sup ON s.SupplierID = sup.SupplierID
                ORDER BY
                    s.DateStocked DESC, s.StockID DESC
            ");
            $stockHistory = $stmt->fetchAll();

            // Format history data to match frontend structure
             $formattedHistory = array_map(function($item) {
                 return [
                     'id' => $item['StockID'],
                     'date' => $item['DateStocked'],
                     'barcode' => $item['Barcode'],
                     'productName' => $item['ProductName'], // Added productName
                     'supplier' => $item['SupplierName'],
                     'quantity' => (int)$item['StockQuantity'],
                     'unitCost' => (float)$item['UnitCost'],
                     'totalCost' => (float)$item['TotalCost'],
                 ];
             }, $stockHistory);

             error_log("Successfully fetched stock history, returning " . count($formattedHistory) . " items.");
            echo json_encode(['success' => true, 'history' => $formattedHistory]);

        } else { // Default to fetching Stock List (aggregated by product with calculated stock)
            // Fetch Stock List with Calculated Current Stock
            error_log("Fetching stock list with corrected calculation");
            // Corrected query using subqueries for accurate aggregation
            $stmt = $pdo->query("
                SELECT
                    p.ProductID,
                    p.Barcode,
                    p.ProductName,
                    COALESCE(ts.TotalStocked, 0) AS TotalStocked,
                    COALESCE(tsi.TotalSold, 0) AS TotalSold,
                    (COALESCE(ts.TotalStocked, 0) - COALESCE(tsi.TotalSold, 0)) AS CurrentStock
                FROM
                    product p
                LEFT JOIN
                    (SELECT ProductID, SUM(StockQuantity) AS TotalStocked FROM stocks GROUP BY ProductID) ts ON p.ProductID = ts.ProductID
                LEFT JOIN
                    (SELECT ProductID, SUM(QuantitySold) AS TotalSold FROM salesitem GROUP BY ProductID) tsi ON p.ProductID = tsi.ProductID
                ORDER BY
                    p.Barcode ASC
            ");
            $stockList = $stmt->fetchAll();

             // Determine status based on calculated quantity using the new logic
             $formattedStockList = array_map(function($item) {
                 $quantity = (int)$item['CurrentStock']; // Use calculated stock
                 $status = getStockStatus($quantity); // Use the helper function

                  // Log detailed stock calculation components
                 error_log("Stock List Item - ProductID: " . $item['ProductID'] .
                           ", Barcode: " . $item['Barcode'] .
                           ", TotalStocked: " . $item['TotalStocked'] .
                           ", TotalSold: " . $item['TotalSold'] .
                           ", Calculated CurrentStock: " . $item['CurrentStock'] .
                           ", Displayed Quantity: " . $quantity);


                 return [
                     'id' => $item['ProductID'], // Use ProductID as item ID
                     'barcode' => $item['Barcode'],
                     'quantity' => $quantity,
                     'status' => $status,
                 ];
             }, $stockList);

            error_log("Successfully fetched stock list, returning " . count($formattedStockList) . " items.");
            echo json_encode(['success' => true, 'stockList' => $formattedStockList]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Stocks GET PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to fetch stock data.']);
    } catch (Exception $e) {
         http_response_code(500);
         error_log("Stocks GET Exception: " . $e->getMessage());
         echo json_encode(['success' => false, 'error' => 'An unexpected error occurred.']);
    }


} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    error_log("Stocks.php received POST request");
    error_log("POST data: " . print_r($_POST, true));

    // Add New Stock
    // Assuming frontend sends data as FormData
    $date = $_POST['date'] ?? date('Y-m-d');
    $barcode = $_POST['barcode'] ?? '';
    $supplierName = $_POST['supplier'] ?? '';
    $quantity = $_POST['quantity'] ?? '';
    $unitCost = $_POST['unitCost'] ?? '';
    // totalCost is calculated frontend, but we re-calculate here for consistency

    if (empty($barcode) || empty($supplierName) || !is_numeric($quantity) || $quantity <= 0 || !is_numeric($unitCost) || $unitCost < 0) {
        error_log("Validation failed: Missing or invalid data");
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Barcode, supplier, valid quantity, and unit cost are required.']);
        exit;
    }

    $totalCost = (float)$quantity * (float)$unitCost;


    try {
        $pdo->beginTransaction();
        error_log("Transaction started");

        // 1. Find ProductID based on Barcode
        error_log("Looking up ProductID for barcode: " . $barcode);
        $stmt = $pdo->prepare("SELECT ProductID FROM product WHERE Barcode = :barcode");
        $stmt->bindParam(':barcode', $barcode);
        $stmt->execute();
        $product = $stmt->fetch();

        if (!$product) {
            $pdo->rollBack();
            error_log("Product not found for barcode: " . $barcode);
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => "Product with barcode '{$barcode}' not found."]);
            exit;
        }
        $productID = $product['ProductID'];
        error_log("Found ProductID: " . $productID);


        // 2. Find or Insert Supplier
         error_log("Looking up or inserting SupplierID for name: " . $supplierName);
         $stmt = $pdo->prepare("SELECT SupplierID FROM supplier WHERE SupplierName = :supplierName");
         $stmt->bindParam(':supplierName', $supplierName);
         $stmt->execute();
         $supplier = $stmt->fetch();

         $supplierID = null;
         if ($supplier) {
             $supplierID = $supplier['SupplierID'];
              error_log("Found SupplierID: " . $supplierID);
         } else {
             error_log("Supplier not found, inserting new supplier");
             $stmt = $pdo->prepare("INSERT INTO supplier (SupplierName) VALUES (:supplierName)");
             $stmt->bindParam(':supplierName', $supplierName);
             $stmt->execute();
             $supplierID = $pdo->lastInsertId();
             error_log("Inserted new SupplierID: " . $supplierID);
         }


        // 3. Insert into Stocks table (StockStatus column is not used in frontend history display)
        error_log("Inserting new stock record");
        $stmt = $pdo->prepare("INSERT INTO stocks (ProductID, SupplierID, DateStocked, StockQuantity, UnitCost) VALUES (:productID, :supplierID, :dateStocked, :stockQuantity, :unitCost)");
        $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
        $stmt->bindParam(':supplierID', $supplierID, PDO::PARAM_INT);
        $stmt->bindParam(':dateStocked', $date);
        $stmt->bindParam(':stockQuantity', $quantity, PDO::PARAM_INT);
        $stmt->bindParam(':unitCost', $unitCost);
        $stmt->execute();
        $stockID = $pdo->lastInsertId();
         error_log("Inserted StockID: " . $stockID);


        // Commit the transaction
        $pdo->commit();
        error_log("Transaction committed successfully");

        // Return details of the added stock history item
         echo json_encode([
             'success' => true,
             'message' => 'Stock added successfully!',
             'stockItem' => [
                 'id' => $stockID,
                 'date' => $date,
                 'barcode' => $barcode, // Include barcode for frontend mapping
                 'supplier' => $supplierName,
                 'quantity' => (int)$quantity,
                 'unitCost' => (float)$unitCost,
                 'totalCost' => $totalCost,
             ]
         ]);
         error_log("Successful response sent");


    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Stocks POST PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Failed to add stock: ' . $e->getMessage()]);
         error_log("PDOException error response sent");
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Stocks POST Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An unexpected error occurred: ' . $e->getMessage()]);
         error_log("General Exception error response sent");
    }

} else {
    // Invalid request method
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>