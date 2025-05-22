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

require_once 'database.php'; 

$accountID = $_POST['accountID'] ?? '';
$fullName = $_POST['fullName'] ?? '';
$email = $_POST['email'] ?? '';
$phoneNumber = $_POST['phoneNumber'] ?? '';

$profilePicturePath = null;

// Handle profile picture upload
if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] == UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['profilePicture']['tmp_name'];
    $fileName = $_FILES['profilePicture']['name'];
    $fileSize = $_FILES['profilePicture']['size'];
    $fileType = $_FILES['profilePicture']['type'];
    $fileNameCmps = explode(".", $fileName);
    $fileExtension = strtolower(end($fileNameCmps));

    // Sanitize file name
    $sanitizedFileName = preg_replace("/[^a-zA-Z0-9_.]/", "", $fileNameCmps[0]);
    $newFileName = md5(time() . $sanitizedFileName) . '.' . $fileExtension;

    // Directory configuration - adjust as needed
    $uploadFileDir = '../profile_pictures/';
    $destPath = $uploadFileDir . $newFileName;

    // Check if directory exists, if not create it
    if (!is_dir($uploadFileDir)) {
        mkdir($uploadFileDir, 0755, true);
    }

    // Allowed file types and size (2MB max)
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    $maxFileSize = 2 * 1024 * 1024; // 2MB

    // Validate file
    if (!in_array($fileExtension, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid file type. Only JPG, PNG, GIF allowed.']);
        exit;
    }

    if ($fileSize > $maxFileSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File size too large. Max 2MB allowed.']);
        exit;
    }

    // Check if image is valid
    $check = getimagesize($fileTmpPath);
    if ($check === false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'File is not a valid image.']);
        exit;
    }

    // Move the file and set path for database
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        // Get the old profile picture path to delete it later
        $stmt = $pdo->prepare("SELECT ProfilePicture FROM account WHERE AccountID = ?");
        $stmt->execute([$accountID]);
        $oldProfilePicture = $stmt->fetchColumn();
        
        $profilePicturePath = 'profile_pictures/' . $newFileName; // Relative path for DB
        
        // Delete old profile picture if it exists
        if ($oldProfilePicture && file_exists('../' . $oldProfilePicture)) {
            @unlink('../' . $oldProfilePicture);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save uploaded file.']);
        exit;
    }
}

// Basic validation
if (empty($accountID) || empty($fullName) || empty($email) || empty($phoneNumber)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit;
}

try {
    // Start building the SQL query
    $sql = "UPDATE account SET FullName = :fullName, Email = :email, PhoneNumber = :phoneNumber";
    $params = [
        ':fullName' => $fullName,
        ':email' => $email,
        ':phoneNumber' => $phoneNumber,
        ':accountID' => $accountID
    ];

    // Add ProfilePicture to update query if a new picture was uploaded
    if ($profilePicturePath !== null) {
        $sql .= ", ProfilePicture = :profilePicture";
        $params[':profilePicture'] = $profilePicturePath;
    }

    $sql .= " WHERE AccountID = :accountID";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() > 0 || $profilePicturePath !== null) {
        echo json_encode([
            'success' => true, 
            'message' => 'Account updated successfully.',
            'profilePicture' => $profilePicturePath
        ]);
    } else {
        echo json_encode(['success' => true, 'message' => 'No changes detected.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log("UpdateAccount PDOException: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error occurred.']);
} catch (Exception $e) {
    http_response_code(500);
    error_log("UpdateAccount Exception: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'An unexpected error occurred.']);
}
?>