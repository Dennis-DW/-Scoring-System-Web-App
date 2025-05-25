<?php
// refresh_token.php
header('Content-Type: application/json');
require_once '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$data = json_decode(file_get_contents('php://input'), true);
$refresh_token = $data['refresh_token'] ?? '';

if (empty($refresh_token)) {
    http_response_code(400);
    exit(json_encode(['error' => 'Refresh token is required']));
}

try {
    // Validate refresh token from database
    $stmt = $pdo->prepare('
        SELECT t.*, j.username, j.display_name, r.name as role 
        FROM tokens t
        JOIN judges j ON t.judge_id = j.id
        JOIN roles r ON j.role_id = r.id
        WHERE t.refresh_token = ? 
        AND t.expires_at > NOW()
        AND j.is_active = TRUE
    ');
    $stmt->execute([$refresh_token]);
    $token_data = $stmt->fetch();

    if (!$token_data) {
        http_response_code(401);
        exit(json_encode(['error' => 'Invalid or expired refresh token']));
    }

    // Generate new tokens
    $new_token = bin2hex(random_bytes(32));
    $new_refresh_token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
    $refresh_expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));

    // Begin transaction
    $pdo->beginTransaction();

    try {
        // Invalidate old token
        $stmt = $pdo->prepare('DELETE FROM tokens WHERE refresh_token = ?');
        $stmt->execute([$refresh_token]);

        // Store new tokens
        $stmt = $pdo->prepare('
            INSERT INTO tokens (judge_id, token, refresh_token, expires_at) 
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([
            $token_data['judge_id'],
            $new_token,
            $new_refresh_token,
            $expires_at
        ]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'token' => $new_token,
            'refresh_token' => $new_refresh_token,
            'expires_at' => $expires_at,
            'user' => [
                'id' => $token_data['judge_id'],
                'username' => $token_data['username'],
                'display_name' => $token_data['display_name'],
                'role' => $token_data['role']
            ]
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['error' => 'Server error']);
}