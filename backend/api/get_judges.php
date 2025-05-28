<?php
// api/get_judges.php

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
    
    $query = "
        SELECT 
            j.id,
            j.username,
            j.display_name,
            j.email,
            j.is_active,
            r.name as role_name,
            COUNT(s.id) as scores_given,
            COUNT(DISTINCT s.participant_id) as participants_scored,
            COALESCE(AVG(s.points), 0) as average_score,
            MAX(s.created_at) as last_activity
        FROM judges j
        LEFT JOIN roles r ON j.role_id = r.id
        LEFT JOIN scores s ON j.id = s.judge_id
        WHERE j.is_active = TRUE
        GROUP BY j.id, j.username, j.display_name, j.email, j.is_active, r.name
        ORDER BY j.display_name ASC
    ";
    
    $stmt = $pdo->query($query);
    $judges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'judges' => array_map(function($j) {
            return [
                'id' => (int)$j['id'],
                'username' => $j['username'],
                'display_name' => $j['display_name'],
                'email' => $j['email'],
                'role' => $j['role_name'],
                'is_active' => (bool)$j['is_active'],
                'stats' => [
                    'scores_given' => (int)$j['scores_given'],
                    'participants_scored' => (int)$j['participants_scored'],
                    'average_score' => round(floatval($j['average_score']), 2),
                    'last_activity' => $j['last_activity']
                ]
            ];
        }, $judges)
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}