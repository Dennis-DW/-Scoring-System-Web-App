<?php
// get_recent_scores.php
header('Content-Type: application/json');
require_once '/../config/db_connect.php';
require_once '../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

try {
    // Get query parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $total = $pdo->query('SELECT COUNT(*) FROM scores')->fetchColumn();

    // Get recent scores with judge and participant info
    $stmt = $pdo->prepare('
        SELECT 
            s.id,
            s.points,
            s.comments,
            s.created_at,
            j.display_name as judge_name,
            p.name as participant_name,
            c.name as category_name
        FROM scores s
        JOIN judges j ON s.judge_id = j.id
        JOIN participants p ON s.participant_id = p.id
        LEFT JOIN categories c ON s.category_id = c.id
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$limit, $offset]);
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ],
        'scores' => $scores
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}