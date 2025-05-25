<?php
// update_profile.php
header('Content-Type: application/json');
require_once '/../config/db_connect.php';
require_once '../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

try {
    $user = validateToken();
    if (!$user) {
        http_response_code(401);
        exit(json_encode(['error' => 'Unauthorized']));
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    $allowedFields = ['display_name', 'email', 'current_password', 'new_password'];
    $updateData = array_intersect_key($data, array_flip($allowedFields));
    
    if (empty($updateData)) {
        http_response_code(400);
        exit(json_encode(['error' => 'No valid fields to update']));
    }

    // Validate email if provided
    if (isset($updateData['email'])) {
        if (!filter_var($updateData['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            exit(json_encode(['error' => 'Invalid email format']));
        }

        // Check if email is already taken
        $stmt = $pdo->prepare('SELECT id FROM judges WHERE email = ? AND id != ?');
        $stmt->execute([$updateData['email'], $user['id']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            exit(json_encode(['error' => 'Email already in use']));
        }
    }

    // Handle password update
    if (isset($updateData['new_password'])) {
        if (!isset($updateData['current_password'])) {
            http_response_code(400);
            exit(json_encode(['error' => 'Current password is required']));
        }

        // Verify current password
        $stmt = $pdo->prepare('SELECT password_hash FROM judges WHERE id = ?');
        $stmt->execute([$user['id']]);
        $current = $stmt->fetch();

        if (!password_verify($updateData['current_password'], $current['password_hash'])) {
            http_response_code(400);
            exit(json_encode(['error' => 'Current password is incorrect']));
        }

        // Validate new password
        if (strlen($updateData['new_password']) < 8) {
            http_response_code(400);
            exit(json_encode(['error' => 'Password must be at least 8 characters']));
        }

        $updateData['password_hash'] = password_hash($updateData['new_password'], PASSWORD_DEFAULT);
        unset($updateData['new_password']);
        unset($updateData['current_password']);
    }

    // Build update query
    $updateFields = [];
    $params = [];
    foreach ($updateData as $field => $value) {
        $updateFields[] = "$field = ?";
        $params[] = $value;
    }
    $params[] = $user['id'];

    $stmt = $pdo->prepare('
        UPDATE judges 
        SET ' . implode(', ', $updateFields) . '
        WHERE id = ?
    ');
    $stmt->execute($params);

    // Get updated profile
    $stmt = $pdo->prepare('
        SELECT 
            id,
            username,
            display_name,
            email,
            role,
            created_at,
            last_login
        FROM judges 
        WHERE id = ?
    ');
    $stmt->execute([$user['id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'profile' => $profile
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}