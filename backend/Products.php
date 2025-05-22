<?php
// products.php - Handles Product data operations

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173"); // Adjust if your frontend is on a different origin
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php'; // Include your database connection

// Helper function to calculate current stock (assuming this function is already defined as in previous versions)
function calculateCurrentStock($pdo, $productID) {
    $stmt = $pdo->prepare("
        SELECT
            COALESCE(SUM(s.StockQuantity), 0) - COALESCE(SUM(si.QuantitySold), 0) AS CurrentStock
        FROM
            product p
        LEFT JOIN
            stocks s ON p.ProductID = s.ProductID
        LEFT JOIN
            salesitem si ON p.ProductID = si.ProductID
        WHERE p.ProductID = :productID
        GROUP BY
            p.ProductID
    ");
    $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
    $stmt->execute();
    $result = $stmt->fetch();
    return $result ? (int)$result['CurrentStock'] : 0;
}


if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['barcode'])) {
        // Fetch Product by Barcode
        $barcode = $_GET['barcode'];
        if (empty($barcode)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Barcode parameter cannot be empty.']);
            exit;
        }
        try {
            $stmt = $pdo->prepare("
                SELECT
                    p.ProductID,
                    p.Barcode,
                    p.ProductName,
                    pp.UnitPrice,
                    pc.CategoryName
                FROM
                    product p
                JOIN
                    productprice pp ON p.ProductID = pp.ProductID
                JOIN
                    productcategory pc ON p.ProdCategoryID = pc.ProdCategoryID
                WHERE p.Barcode = :barcode
                LIMIT 1
            ");
            $stmt->bindParam(':barcode', $barcode);
            $stmt->execute();
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                 // Calculate current stock for this specific product if found
                 $product['CurrentStock'] = calculateCurrentStock($pdo, $product['ProductID']);
                 echo json_encode(['success' => true, 'product' => $product]);
            } else {
                 http_response_code(404); // Not Found
                 echo json_encode(['success' => false, 'error' => 'Product not found with this barcode.']);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Products GET (by barcode) PDOException: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Failed to fetch product by barcode.']);
        } catch (Exception $e) {
             http_response_code(500);
             error_log("Products GET (by barcode) Exception: " . $e->getMessage());
             echo json_encode(['success' => false, 'error' => 'An unexpected error occurred while fetching product by barcode.']);
        }
    } else {
        // Fetch All Products (Existing logic)
         try {
            $stmt = $pdo->query("
                SELECT
                    p.ProductID,
                    p.Barcode,
                    p.ProductName,
                    pp.UnitPrice,
                    pc.CategoryName
                FROM
                    product p
                JOIN
                    productprice pp ON p.ProductID = pp.ProductID
                JOIN
                    productcategory pc ON p.ProdCategoryID = pc.ProdCategoryID
            ");
            $products = $stmt->fetchAll();

            // For each product, calculate the current stock
            foreach ($products as &$product) {
                 $product['CurrentStock'] = calculateCurrentStock($pdo, $product['ProductID']);
            }
            unset($product); // Unset reference

            echo json_encode(['success' => true, 'products' => $products]);

        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Products GET (all) PDOException: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'Failed to fetch products.']);
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Products GET (all) Exception: " . $e->getMessage());
            echo json_encode(['success' => false, 'error' => 'An unexpected error occurred.']);
        }
    }

} 

elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Handle both Add and Update Product via POST (Image handling removed)

    $productID = $_POST['productID'] ?? null;
    $barcode = $_POST['barcode'] ?? '';
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $categoryName = $_POST['category'] ?? '';

    if (empty($barcode) || empty($name) || empty($price) || empty($categoryName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Barcode, name, price, and category are required.']);
        exit;
    }

    if (!is_numeric($price) || $price < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Price must be a non-negative number.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Find or insert Product Category
        $stmt = $pdo->prepare("SELECT ProdCategoryID FROM productcategory WHERE CategoryName = :categoryName");
        $stmt->bindParam(':categoryName', $categoryName);
        $stmt->execute();
        $category = $stmt->fetch();

        $prodCategoryID = null;
        if ($category) {
            $prodCategoryID = $category['ProdCategoryID'];
        } else {
            $stmt = $pdo->prepare("INSERT INTO productcategory (CategoryName) VALUES (:categoryName)");
            $stmt->bindParam(':categoryName', $categoryName);
            $stmt->execute();
            $prodCategoryID = $pdo->lastInsertId();
        }

        if ($productID !== null) {
            // --- Update Existing Product ---

            $stmt = $pdo->prepare("SELECT ProductID FROM product WHERE ProductID = :productID");
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->execute();
            if (!$stmt->fetch()) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Product not found for update.']);
                exit;
            }

            // Update Product table (Image column removed from UPDATE)
            $stmt = $pdo->prepare("UPDATE product SET Barcode = :barcode, ProductName = :productName, ProdCategoryID = :prodCategoryID WHERE ProductID = :productID");
            $stmt->bindParam(':barcode', $barcode);
            $stmt->bindParam(':productName', $name);
            $stmt->bindParam(':prodCategoryID', $prodCategoryID, PDO::PARAM_INT);
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->execute();

            // Update ProductPrice table
            $stmt = $pdo->prepare("UPDATE productprice SET UnitPrice = :unitPrice WHERE ProductID = :productID");
            $stmt->bindParam(':unitPrice', $price);
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->execute();

            $message = 'Product updated successfully!';

        } else {
            // --- Add New Product ---

            // Check if barcode already exists
            $stmt = $pdo->prepare("SELECT ProductID FROM product WHERE Barcode = :barcode");
            $stmt->bindParam(':barcode', $barcode);
            $stmt->execute();
            if ($stmt->fetch()) {
                 $pdo->rollBack();
                 http_response_code(409); // Conflict
                 echo json_encode(['success' => false, 'error' => 'A product with this barcode already exists.']);
                 exit;
            }

            // Insert into Product table 
            $stmt = $pdo->prepare("INSERT INTO product (Barcode, ProductName, ProdCategoryID) VALUES (:barcode, :productName, :prodCategoryID)");
            $stmt->bindParam(':barcode', $barcode);
            $stmt->bindParam(':productName', $name);
            $stmt->bindParam(':prodCategoryID', $prodCategoryID, PDO::PARAM_INT);
            $stmt->execute();
            $productID = $pdo->lastInsertId();

            // Insert into ProductPrice table
            $stmt = $pdo->prepare("INSERT INTO productprice (ProductID, UnitPrice) VALUES (:productID, :unitPrice)");
            $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
            $stmt->bindParam(':unitPrice', $price);
            $stmt->execute();

            $message = 'Product added successfully!';
        }


        // Commit the transaction
        $pdo->commit();

        // Return the updated/added product details with calculated stock
         $currentStock = calculateCurrentStock($pdo, $productID);

        echo json_encode([
            'success' => true,
            'message' => $message,
            'product' => [
                'ProductID' => $productID,
                'Barcode' => $barcode,
                'ProductName' => $name,
                'UnitPrice' => (float)$price,
                'CategoryName' => $categoryName,
                'CurrentStock' => $currentStock
            ]
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Products POST PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Database operation failed: ' . $e->getMessage()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Products POST Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An unexpected error occurred: ' . $e->getMessage()]);
    }

}
// DELETE request handling for products (No changes needed here related to image)
elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
     $input = json_decode(file_get_contents('php://input'), true);
     $productID = $input['productID'] ?? null;

     if ($productID === null) {
         http_response_code(400);
         echo json_encode(['success' => false, 'error' => 'ProductID is required for deletion.']);
         exit;
     }

     try {
         $pdo->beginTransaction();

         // Delete related records first due to foreign key constraints
         $stmt = $pdo->prepare("DELETE si FROM salesitem si JOIN product p ON si.ProductID = p.ProductID WHERE p.ProductID = :productID");
         $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
         $stmt->execute();

         $stmt = $pdo->prepare("DELETE FROM stocks WHERE ProductID = :productID");
         $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
         $stmt->execute();

         $stmt = $pdo->prepare("DELETE FROM productprice WHERE ProductID = :productID");
         $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
         $stmt->execute();

         $stmt = $pdo->prepare("DELETE FROM product WHERE ProductID = :productID");
         $stmt->bindParam(':productID', $productID, PDO::PARAM_INT);
         $stmt->execute();

         $pdo->commit();

         if ($stmt->rowCount() > 0) {
             echo json_encode(['success' => true, 'message' => 'Product and related data deleted successfully!']);
         } else {
             http_response_code(404);
             echo json_encode(['success' => false, 'error' => 'Product not found for deletion.']);
         }


     } catch (PDOException $e) {
         $pdo->rollBack();
         http_response_code(500);
         error_log("Products DELETE PDOException: " . $e->getMessage());
         echo json_encode(['success' => false, 'error' => 'Failed to delete product: ' . $e->getMessage()]);
     } catch (Exception $e) {
         $pdo->rollBack();
         http_response_code(500);
         error_log("Products DELETE Exception: " . $e->getMessage());
         echo json_encode(['success' => false, 'error' => 'An unexpected error occurred during deletion: ' . $e->getMessage()]);
     }

}
else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
}
?>