<?php
require '/../config/db_connect.php';

try {
    // Get active judges with their scoring stats
    $stmt = $pdo->query('
        SELECT 
            j.id,
            j.username,
            j.display_name,
            j.email,
            j.created_at,
            j.is_active,
            COUNT(DISTINCT s.participant_id) as participants_scored,
            COUNT(s.id) as total_scores,
            MAX(s.created_at) as last_scored_at
        FROM judges j
        LEFT JOIN scores s ON j.id = s.judge_id
        WHERE j.is_active = TRUE
        GROUP BY j.id
        ORDER BY j.display_name ASC
    ');
    
    $judges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    $formattedJudges = array_map(function($judge) {
        return [
            'id' => $judge['id'],
            'username' => $judge['username'],
            'display_name' => $judge['display_name'],
            'email' => $judge['email'],
            'stats' => [
                'participants_scored' => (int)$judge['participants_scored'],
                'total_scores' => (int)$judge['total_scores'],
                'last_scored' => $judge['last_scored_at'] ? date('Y-m-d H:i:s', strtotime($judge['last_scored_at'])) : null
            ],
            'created_at' => date('Y-m-d H:i:s', strtotime($judge['created_at'])),
            'is_active' => (bool)$judge['is_active']
        ];
    }, $judges);
    
    echo json_encode([
        'success' => true,
        'count' => count($formattedJudges),
        'judges' => $formattedJudges
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
