<?php

require '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    // Get pagination parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, min(50, intval($_GET['limit']))) : 10;
    $offset = ($page - 1) * $limit;

    // Get total count
    $total = $pdo->query('SELECT COUNT(*) FROM participants WHERE is_active = TRUE')->fetchColumn();

    // Get participants with their scores
    $stmt = $pdo->prepare('
        SELECT 
            p.*,
            COUNT(DISTINCT s.judge_id) as judges_count,
            COALESCE(AVG(s.points), 0) as average_score,
            MAX(s.created_at) as last_scored,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        "category_id", s2.category_id,
                        "points", AVG(s2.points)
                    )
                )
                FROM scores s2
                WHERE s2.participant_id = p.id
                GROUP BY s2.category_id
            ) as category_scores
        FROM participants p
        LEFT JOIN scores s ON p.id = s.participant_id
        WHERE p.is_active = TRUE
        GROUP BY p.id
        ORDER BY p.name ASC
        LIMIT ? OFFSET ?
    ');
    
    $stmt->execute([$limit, $offset]);
    $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format response
    $formattedParticipants = array_map(function($participant) {
        return [
            'id' => $participant['id'],
            'name' => $participant['name'],
            'email' => $participant['email'] ?? null,
            'registration_number' => $participant['registration_number'] ?? null,
            'stats' => [
                'judges_count' => (int)$participant['judges_count'],
                'average_score' => round($participant['average_score'], 2),
                'last_scored' => $participant['last_scored'] ? 
                    date('Y-m-d H:i:s', strtotime($participant['last_scored'])) : null,
                'category_scores' => json_decode($participant['category_scores'] ?? '[]')
            ],
            'created_at' => date('Y-m-d H:i:s', strtotime($participant['created_at']))
        ];
    }, $participants);

    echo json_encode([
        'success' => true,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ],
        'participants' => $formattedParticipants
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
?>
