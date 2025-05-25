<?php
// get_participants.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../config/db_connect.php';

try {
    $pdo = connectDB();
    
    // Get participants with scores
    $query = "
        SELECT 
            p.id,
            p.name,
            p.email,
            p.registration_number,
            p.bio,
            p.is_active,
            COUNT(s.id) as total_scores,
            COALESCE(AVG(s.points), 0) as average_score,
            COUNT(DISTINCT s.judge_id) as judges_count,
            MAX(s.created_at) as last_scored
        FROM participants p
        LEFT JOIN scores s ON p.id = s.participant_id
        WHERE p.is_active = TRUE
        GROUP BY p.id
        ORDER BY average_score DESC, p.name ASC
    ";
    
    $stmt = $pdo->query($query);
    $participants = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response = [
        'success' => true,
        'count' => count($participants),
        'timestamp' => date('Y-m-d H:i:s'),
        'participants' => array_map(function($p) {
            return [
                'id' => (int)$p['id'],
                'name' => $p['name'],
                'email' => $p['email'],
                'registration' => $p['registration_number'],
                'stats' => [
                    'total_scores' => (int)$p['total_scores'],
                    'average_score' => round((float)$p['average_score'], 2),
                    'judges_count' => (int)$p['judges_count'],
                    'last_scored' => $p['last_scored']
                ]
            ];
        }, $participants)
    ];
    
    echo json_encode($response, JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}