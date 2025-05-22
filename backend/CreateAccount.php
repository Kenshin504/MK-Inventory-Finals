<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
require 'database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->password) || !isset($data->role) || !isset($data->fullName) || !isset($data->email) || !isset($data->phoneNumber)) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$username = $data->username;
$password = password_hash($data->password, PASSWORD_DEFAULT); 
$role = $data->role;
$fullName = $data->fullName;
$email = $data->email;
$phoneNumber = $data->phoneNumber;

// Check if the username already exists
$query = "SELECT * FROM account WHERE Username = :username";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':username', $username);
$stmt->execute();
if ($stmt->rowCount() > 0) {
    echo json_encode(["success" => false, "error" => "Username already exists"]);
    exit;
}

// Insert the new user into the database
$query = "INSERT INTO account (Username, password, role, fullName, email, phoneNumber) VALUES (:username, :password, :role, :fullName, :email, :phoneNumber)";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':username', $username);
$stmt->bindParam(':password', $password);
$stmt->bindParam(':role', $role);
$stmt->bindParam(':fullName', $fullName);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':phoneNumber', $phoneNumber);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to create account"]);
}
?>