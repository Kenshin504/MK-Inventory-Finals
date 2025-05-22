<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username and password are required.']);
        exit;
    }

    try {
        // Fetch AccountID, Username, Password, Role, FullName, Email, and PhoneNumber
        $stmt = $pdo->prepare("SELECT AccountID, Username, Password, Role, FullName, Email, PhoneNumber FROM account WHERE Username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if (password_verify($password, $user['Password'])) {
                // Password is correct
                // Keep setting session for other potential uses
                $_SESSION['user_id'] = $user['AccountID'];
                $_SESSION['username'] = $user['Username'];
                $_SESSION['role'] = $user['Role'];

                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful!',
                    'accountID' => $user['AccountID'],
                    'role' => $user['Role'],
                    'username' => $user['Username'],
                    'fullName' => $user['FullName'], 
                    'email' => $user['Email'],       
                    'phoneNumber' => $user['PhoneNumber'] 
                ]);
                exit;
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
                exit;
            }
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid username or password.']);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        error_log("Login PDOException: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'An error occurred during login. Please try again.']);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        error_log("Login Exception: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'A server error occurred: ' . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method. Only POST is accepted.']);
}
?>