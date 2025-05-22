<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS"); // Allow POST and DELETE
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php'; // Ensure this path is correct

// Get the posted JSON data
// Use file_get_contents for DELETE requests with a body
$data = json_decode(file_get_contents("php://input"), true);

// Check for required fields
if (!isset($data['accountID'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Account ID is required for deletion.']);
    exit;
}

$accountID = $data['accountID'];

// Basic validation
if (empty($accountID)) {
     http_response_code(400);
     echo json_encode(['success' => false, 'error' => 'Account ID cannot be empty.']);
     exit;
}

// Important Security Check: Prevent deleting the currently logged-in user's account
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$loggedInAccountID = $_SESSION['user_id'] ?? null;

if ($loggedInAccountID !== null && $accountID == $loggedInAccountID) {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'error' => 'Cannot delete your own account.']);
    exit;
}

// Also prevent deleting the 'Owner' role account if you have specific rules
try {
    $stmtCheckRole = $pdo->prepare("SELECT Role FROM account WHERE AccountID = :accountID");
    $stmtCheckRole->bindParam(':accountID', $accountID);
    $stmtCheckRole->execute();
    $accountToDelete = $stmtCheckRole->fetch(PDO::FETCH_ASSOC);

    if ($accountToDelete && $accountToDelete['Role'] === 'Owner') {
         // Assuming you don't want to delete Owner accounts this way
         http_response_code(403); // Forbidden
         echo json_encode(['success' => false, 'error' => 'Cannot delete an Owner account.']);
         exit;
    }

} catch (PDOException $e) {
     http_response_code(500);
     error_log("DeleteAccount PDOException (Role check): " . $e->getMessage());
     echo json_encode(['success' => false, 'error' => 'Database error during role check.']);
     exit;
}


// Delete the account from the database
try {
    $stmt = $pdo->prepare("DELETE FROM account WHERE AccountID = :accountID");
    $stmt->bindParam(':accountID', $accountID);

    if ($stmt->execute()) {
        // Check if any rows were affected
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Account deleted successfully.']);
        } else {
            // Account ID did not exist
            http_response_code(404); // Not Found
            echo json_encode(['success' => false, 'error' => 'Account not found.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to delete account.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("DeleteAccount PDOException (Delete): " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'An error occurred while deleting account.']);
} catch (Exception $e) {
    http_response_code(500);
    error_log("DeleteAccount Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'A server error occurred: ' . $e->getMessage()]);
}

?>
