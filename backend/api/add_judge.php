<?php
// api/add_judge.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: https://white-meadow-0c5eba71e.6.azurestaticapps.net");

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = connectDB();
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Extract and sanitize inputs
        $username = filter_var($data['username'] ?? '', FILTER_SANITIZE_STRING);
        $display_name = filter_var($data['display_name'] ?? '', FILTER_SANITIZE_STRING);
        $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
        $password = $data['password'] ?? '';
        $role_id = filter_var($data['role_id'] ?? 2, FILTER_VALIDATE_INT); // Default to judge role

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
            echo json_encode(['success' => false, 'errors' => $errors]);
            exit;
        }

        $pdo->beginTransaction();

        // Check if username or email exists
        $stmt = $pdo->prepare('SELECT id FROM judges WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            throw new Exception('Username or email already exists', 409);
        }

        // Verify role exists
        $stmt = $pdo->prepare('SELECT id FROM roles WHERE id = ?');
        $stmt->execute([$role_id]);
        if (!$stmt->fetch()) {
            throw new Exception('Invalid role', 400);
        }

        // Insert new judge
        $stmt = $pdo->prepare('
            INSERT INTO judges (
                username, 
                display_name, 
                email, 
                password_hash, 
                role_id,
                is_active,
                created_at
            ) VALUES (?, ?, ?, ?, ?, TRUE, NOW())
        ');
        
        $stmt->execute([
            $username,
            $display_name,
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            $role_id
        ]);
        
        $newJudgeId = $pdo->lastInsertId();

        // Log to audit trail
        $stmt = $pdo->prepare('
            INSERT INTO audit_trail (
                table_name,
                record_id,
                action,
                changes
            ) VALUES (?, ?, ?, ?)
        ');
        
        $stmt->execute([
            'judges',
            $newJudgeId,
            'INSERT',
            json_encode([
                'username' => $username,
                'display_name' => $display_name,
                'email' => $email,
                'role_id' => $role_id
            ])
        ]);

        // Fetch created judge
        $stmt = $pdo->prepare('
            SELECT j.id, j.username, j.display_name, j.email, j.created_at, r.name as role
            FROM judges j
            JOIN roles r ON j.role_id = r.id
            WHERE j.id = ?
        ');
        $stmt->execute([$newJudgeId]);
        $judge = $stmt->fetch(PDO::FETCH_ASSOC);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Judge added successfully',
            'judge' => $judge
        ]);

    } catch (Exception $e) {
        if ($pdo && $pdo->inTransaction()) {
            $pdo->rollBack();
        }

        $code = $e->getCode() ?: 500;
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
