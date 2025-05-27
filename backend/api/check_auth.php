<?php
// api/login.php

header("Access-Control-Allow-Origin: https://white-meadow-0c5eba71e.6.azurestaticapps.net");

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        exit(json_encode([
            'success' => false,
            'error' => 'Email and password are required'
        ]));
    }

    $stmt = $pdo->prepare('
        SELECT j.*, r.name as role 
        FROM judges j
        JOIN roles r ON j.role_id = r.id
        WHERE j.email = ? AND j.is_active = TRUE
    ');
    
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        exit(json_encode([
            'success' => false,
            'error' => 'Invalid credentials'
        ]));
    }

    $token = bin2hex(random_bytes(32));
    $refresh_token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $pdo->prepare('
        INSERT INTO tokens (judge_id, token, refresh_token, expires_at) 
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$user['id'], $token, $refresh_token, $expires_at]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'refresh_token' => $refresh_token,
        'expires_at' => $expires_at,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'role' => $user['role']
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error'
    ]);
}