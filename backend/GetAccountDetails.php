<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS"); 
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'database.php'; 

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $accountID = $_GET['accountID'] ?? '';

    if (empty($accountID)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Account ID is required.']);
        exit;
    }

    try {
        // Fetch user details by AccountID including ProfilePicture
        $stmt = $pdo->prepare("SELECT FullName, Email, PhoneNumber, ProfilePicture FROM account WHERE AccountID = :accountID");
        $stmt->bindParam(':accountID', $accountID);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'success' => true,
                'fullName' => $user['FullName'],
                'email' => $user['Email'],
                'phoneNumber' => $user['PhoneNumber'],
                'profilePicture' => $user['ProfilePicture'] 
            ]);
            exit;
        } else {
            http_response_code(404); // Not Found
            echo json_encode(['success' => false, 'error' => 'Account not found.']);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        error_log("GetAccountDetails PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An error occurred while fetching account details.']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        error_log("GetAccountDetails Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'A server error occurred: ' . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    // Modified error message to be specific
    echo json_encode(['success' => false, 'error' => 'Invalid request method for GetAccountDetails.php. Only GET is accepted.']);
    exit; // Added exit
}
?>