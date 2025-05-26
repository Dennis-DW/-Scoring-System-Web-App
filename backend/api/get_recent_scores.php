<?php
// api/get_recent_scores.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/db_connect.php';

try {
    $pdo = connectDB();
    
    // Get query parameters with defaults
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 20;
    $offset = ($page - 1) * $limit;
    
    // Get total count
    $total = $pdo->query('SELECT COUNT(*) FROM scores')->fetchColumn();

    // Get recent scores with related data
    $query = "
        SELECT 
            s.id,
            s.points,
            s.comments,
            s.created_at,
            s.updated_at,
            j.display_name as judge_name,
            j.username as judge_username,
            p.name as participant_name,
            p.registration_number,
            c.name as category_name,
            c.weight as category_weight
        FROM scores s
        INNER JOIN judges j ON s.judge_id = j.id
        INNER JOIN participants p ON s.participant_id = p.id
        INNER JOIN categories c ON s.category_id = c.id
        WHERE j.is_active = TRUE 
        AND p.is_active = TRUE
        AND c.is_active = TRUE
        ORDER BY s.created_at DESC
        LIMIT :limit OFFSET :offset
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format scores
    $formattedScores = array_map(function($score) {
        return [
            'id' => (int)$score['id'],
            'judge' => [
                'name' => $score['judge_name'],
                'username' => $score['judge_username']
            ],
            'participant' => [
                'name' => $score['participant_name'],
                'registration' => $score['registration_number']
            ],
            'category' => [
                'name' => $score['category_name'],
                'weight' => (int)$score['category_weight']
            ],
            'score' => [
                'points' => (int)$score['points'],
                'comments' => $score['comments'],
                'created_at' => $score['created_at'],
                'updated_at' => $score['updated_at']
            ]
        ];
    }, $scores);

    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ],
        'scores' => $formattedScores
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}