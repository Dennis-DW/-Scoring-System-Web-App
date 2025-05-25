<?php
require_once __DIR__ . '/../helpers/JWT.php';
require_once __DIR__ . '/../config/db_connect.php';

function handleCORS() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}

function validateToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }

    $token = $matches[1];
    $payload = JWT::verify($token);
    if (!$payload) return null;

    // Verify user in database
    global $pdo;
    $stmt = $pdo->prepare('SELECT id, username, role FROM judges WHERE id = ? AND is_active = TRUE');
    $stmt->execute([$payload['user_id']]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function requireRole($roles) {
    $user = validateToken();
    if (!$user) {
        http_response_code(401);
        exit(json_encode(['error' => 'Unauthorized']));
    }

    if (!in_array($user['role'], (array)$roles)) {
        http_response_code(403);
        exit(json_encode(['error' => 'Forbidden']));
    }

    return $user;
}