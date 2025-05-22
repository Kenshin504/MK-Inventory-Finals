<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php'; 

// Get the posted JSON data
$data = json_decode(file_get_contents("php://input"), true);

// Check for required fields
if (!isset($data['accountID']) || !isset($data['newUsername']) || !isset($data['newPassword'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

$accountID = $data['accountID'];
$newUsername = $data['newUsername'];
$newPassword = $data['newPassword'];

// Basic validation
if (empty($accountID) || empty($newUsername) || empty($newPassword)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Fields cannot be empty.']);
    exit;
}

// Validate AccountID exists (optional but recommended)
try {
    $stmt = $pdo->prepare("SELECT AccountID FROM account WHERE AccountID = :accountID");
    $stmt->bindParam(':accountID', $accountID);
    $stmt->execute();
    if ($stmt->rowCount() === 0) {
        http_response_code(404); // Not Found
        echo json_encode(['success' => false, 'error' => 'Account not found.']);
        exit;
    }
} catch (PDOException $e) {
     http_response_code(500);
     error_log("ChangeCredentials PDOException (AccountID check): " . $e->getMessage());
     echo json_encode(['success' => false, 'error' => 'Database error during account check.']);
     exit;
}


// Check if the new username already exists for another account
try {
    $stmt = $pdo->prepare("SELECT AccountID FROM account WHERE Username = :newUsername AND AccountID != :accountID");
    $stmt->bindParam(':newUsername', $newUsername);
    $stmt->bindParam(':accountID', $accountID);
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'error' => 'Username already taken.']);
        exit;
    }
} catch (PDOException $e) {
     http_response_code(500);
     error_log("ChangeCredentials PDOException (Username check): " . $e->getMessage());
     echo json_encode(['success' => false, 'error' => 'Database error during username check.']);
     exit;
}


// Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update the database
try {
    $stmt = $pdo->prepare("UPDATE account SET Username = :newUsername, Password = :hashedPassword WHERE AccountID = :accountID");
    $stmt->bindParam(':newUsername', $newUsername);
    $stmt->bindParam(':hashedPassword', $hashedPassword);
    $stmt->bindParam(':accountID', $accountID);

    if ($stmt->execute()) {
        // Check if any rows were affected
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Credentials updated successfully.']);
        } else {
            // AccountID existed, but username/password were the same
            echo json_encode(['success' => true, 'message' => 'Credentials are already up to date.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to update credentials.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("ChangeCredentials PDOException (Update): " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'An error occurred while updating credentials.']);
} catch (Exception $e) {
    http_response_code(500);
    error_log("ChangeCredentials Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'A server error occurred: ' . $e->getMessage()]);
}

?>