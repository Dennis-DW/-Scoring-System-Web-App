<?php
// get_judge_scores.php
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

    // Get query parameters
    $judge_id = isset($_GET['judge_id']) ? intval($_GET['judge_id']) : $user['id'];
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    $date_from = isset($_GET['date_from']) ? $_GET['date_from'] : null;
    $date_to = isset($_GET['date_to']) ? $_GET['date_to'] : null;

    // Check permission for viewing other judge's scores
    if ($judge_id !== $user['id'] && $user['role'] !== 'admin') {
        http_response_code(403);
        exit(json_encode(['error' => 'Permission denied']));
    }

    // Build query conditions
    $conditions = ['judge_id = ?'];
    $params = [$judge_id];

    if ($date_from) {
        $conditions[] = 'created_at >= ?';
        $params[] = $date_from;
    }
    if ($date_to) {
        $conditions[] = 'created_at <= ?';
        $params[] = $date_to;
    }

    $whereClause = implode(' AND ', $conditions);

    // Get total count
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM scores WHERE $whereClause");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    // Get judge's scores with details
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.points,
            s.comments,
            s.created_at,
            p.name as participant_name,
            c.name as category_name,
            (
                SELECT AVG(points)
                FROM scores s2
                WHERE s2.participant_id = s.participant_id
            ) as participant_average
        FROM scores s
        JOIN participants p ON s.participant_id = p.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE $whereClause
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
    ");

    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get judge's scoring summary
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(DISTINCT participant_id) as participants_scored,
            COUNT(*) as total_scores,
            AVG(points) as average_score,
            MIN(points) as min_score,
            MAX(points) as max_score
        FROM scores
        WHERE judge_id = ?
    ");
    $stmt->execute([$judge_id]);
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);
    $summary['average_score'] = round($summary['average_score'], 2);

    echo json_encode([
        'success' => true,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ],
        'summary' => $summary,
        'scores' => $scores
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}