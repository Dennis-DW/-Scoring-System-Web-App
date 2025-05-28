<?php
// login.php
header("Access-Control-Allow-Origin: *");

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

try {
    $pdo = connectDB();
    
    // Get JSON input
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        exit(json_encode(['error' => 'Email and password are required']));
    }

    // Get user with role information
    $stmt = $pdo->prepare('
        SELECT j.id, j.username, j.display_name, j.password_hash, r.name as role 
        FROM judges j
        JOIN roles r ON j.role_id = r.id
        WHERE j.email = ? AND j.is_active = TRUE
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify credentials using SHA2
    if (!$user || $user['password_hash'] !== hash('sha256', $password)) {
        http_response_code(401);
        exit(json_encode(['error' => 'Invalid credentials']));
    }

    // Generate tokens
    $token = bin2hex(random_bytes(32));
    $refresh_token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store token
    $stmt = $pdo->prepare('
        INSERT INTO tokens (judge_id, token, refresh_token, expires_at) 
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$user['id'], $token, $refresh_token, $expires_at]);

    // Update last login
    $stmt = $pdo->prepare('UPDATE judges SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    $stmt->execute([$user['id']]);

    // Get statistics
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(DISTINCT participant_id) as participants_scored,
            COUNT(*) as total_scores,
            MAX(created_at) as last_score_date
        FROM scores 
        WHERE judge_id = ?
    ');
    $stmt->execute([$user['id']]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'refresh_token' => $refresh_token,
        'expires_at' => $expires_at,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'display_name' => $user['display_name'],
            'role' => $user['role'],
            'stats' => [
                'participants_scored' => (int)$stats['participants_scored'],
                'total_scores' => (int)$stats['total_scores'],
                'last_score_date' => $stats['last_score_date']
            ]
        ]
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}