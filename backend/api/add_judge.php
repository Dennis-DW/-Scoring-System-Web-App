<?php
require '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Extract and sanitize inputs
    $username = filter_var($data['username'] ?? '', FILTER_SANITIZE_STRING);
    $display_name = filter_var($data['display_name'] ?? '', FILTER_SANITIZE_STRING);
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $data['password'] ?? '';

    // Validate inputs
    $errors = [];
    if (empty($username)) $errors['username'] = 'Username is required';
    if (empty($display_name)) $errors['display_name'] = 'Display name is required';
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Valid email is required';
    }
    if (empty($password) || strlen($password) < 8) {
        $errors['password'] = 'Password must be at least 8 characters';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }

    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare('SELECT id FROM judges WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Username or email already exists'
            ]);
            exit;
        }

        // Hash password and insert new judge
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare('
            INSERT INTO judges (username, display_name, email, password_hash) 
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$username, $display_name, $email, $password_hash]);
        
        $newJudgeId = $pdo->lastInsertId();
        
        // Fetch the created judge (excluding password)
        $stmt = $pdo->prepare('
            SELECT id, username, display_name, email, created_at 
            FROM judges 
            WHERE id = ?
        ');
        $stmt->execute([$newJudgeId]);
        $judge = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Judge added successfully',
            'judge' => $judge
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error',
            'message' => $e->getMessage()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Server error',
            'message' => $e->getMessage()
        ]);
    }
}
?>
