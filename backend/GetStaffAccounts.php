<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS"); 
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php'; 

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Prepare SQL statement to select accounts with Role = 'Staff'
        // We select AccountID, Username, FullName, Email, and PhoneNumber
        $stmt = $pdo->prepare("SELECT AccountID, Username, FullName, Email, PhoneNumber FROM account WHERE Role = 'Staff'");

        // Execute the statement
        $stmt->execute();

        // Fetch all results as an associative array
        $staffAccounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return the staff accounts as a JSON array
        echo json_encode(['success' => true, 'staffs' => $staffAccounts]);

    } catch (PDOException $e) {
        http_response_code(500);
        error_log("GetStaffAccounts PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An error occurred while fetching staff accounts.']);
    } catch (Exception $e) {
        http_response_code(500);
        error_log("GetStaffAccounts Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'A server error occurred: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method. Only GET is accepted.']);
}
?>
