<?php
// get_profile.php
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
        exit(json_encode(['error' => 'Unauthorized']));
    }

    $stmt = $pdo->prepare('
        SELECT 
            id,
            username,
            display_name,
            email,
            role,
            created_at,
            last_login,
            (SELECT COUNT(*) FROM scores WHERE judge_id = judges.id) as total_scores
        FROM judges 
        WHERE id = ? AND is_active = TRUE
    ');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        http_response_code(404);
        exit(json_encode(['error' => 'Profile not found']));
    }

    echo json_encode([
        'success' => true,
        'profile' => $profile
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}