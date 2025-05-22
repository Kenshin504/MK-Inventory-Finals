<?php
class Authentication {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function login($username, $password) {
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM account WHERE Username = :username");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($password, $user['password'])) {
                return ['success' => true];
            } else {
                return ['success' => false, 'error' => 'Invalid username or password'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'error' => 'Database error: ' . $e->getMessage()];
        }
    }
}