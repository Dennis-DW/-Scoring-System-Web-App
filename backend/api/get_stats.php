<?php
//backend/api/get_stats.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../config/db_connect.php';

try {
    $pdo = connectDB();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stats = [];

    // Overall Statistics
    $stmt = $pdo->query('
        SELECT 
            (SELECT COUNT(*) FROM participants WHERE is_active = TRUE) as active_participants,
            (SELECT COUNT(*) FROM judges WHERE is_active = TRUE) as active_judges,
            (SELECT COUNT(*) FROM categories WHERE is_active = TRUE) as active_categories,
            (SELECT COUNT(*) FROM scores) as total_scores
    ');
    $stats['overview'] = $stmt->fetch(PDO::FETCH_ASSOC);

    // Category Statistics
    $stmt = $pdo->query('
        SELECT 
            c.name,
            c.weight,
            COUNT(s.id) as total_scores,
            COALESCE(AVG(s.points), 0) as average_score,
            MIN(s.points) as min_score,
            MAX(s.points) as max_score
        FROM categories c
        LEFT JOIN scores s ON c.id = s.category_id
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY c.weight DESC, c.name
    ');
    $stats['categories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Judge Activity
    $stmt = $pdo->query('
        SELECT 
            j.display_name,
            COUNT(s.id) as scores_given,
            COUNT(DISTINCT s.participant_id) as participants_scored,
            ROUND(AVG(s.points), 2) as average_score,
            MAX(s.created_at) as last_activity
        FROM judges j
        LEFT JOIN scores s ON j.id = s.judge_id
        WHERE j.is_active = TRUE
        GROUP BY j.id
        ORDER BY scores_given DESC
    ');
    $stats['judge_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Top Participants
    $stmt = $pdo->query('
        SELECT 
            p.name,
            COUNT(s.id) as total_scores,
            ROUND(AVG(s.points), 2) as average_score,
            COUNT(DISTINCT s.judge_id) as judges_scored
        FROM participants p
        JOIN scores s ON p.id = s.participant_id
        WHERE p.is_active = TRUE
        GROUP BY p.id
        ORDER BY average_score DESC
        LIMIT 5
    ');
    $stats['top_participants'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Recent Activity
    $stmt = $pdo->query('
        SELECT 
            DATE(s.created_at) as date,
            COUNT(*) as scores_count,
            ROUND(AVG(s.points), 2) as average_score,
            COUNT(DISTINCT s.judge_id) as unique_judges,
            COUNT(DISTINCT s.participant_id) as unique_participants
        FROM scores s
        WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(s.created_at)
        ORDER BY date DESC
    ');
    $stats['recent_activity'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'stats' => $stats
    ]);

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log('Server Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error'
    ]);
}