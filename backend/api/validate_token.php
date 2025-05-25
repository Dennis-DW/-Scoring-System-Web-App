<?php
// validate_token.php
header('Content-Type: application/json');
require_once '/../config/db_connect.php';
require_once '../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

try {
    $user = validateToken();
    if (!$user) {
        http_response_code(401);
        exit(json_encode(['error' => 'Invalid token']));
    }

    echo json_encode([
        'success' => true,
        'valid' => true
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}