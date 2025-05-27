<?php
// api/get_categories.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: https://white-meadow-0c5eba71e.6.azurestaticapps.net");

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
            c.id,
            c.name,
            c.description,
            c.weight,
            c.max_points,
            c.is_active,
            COUNT(s.id) as total_scores,
            COALESCE(AVG(s.points), 0) as average_score,
            MIN(s.points) as min_score,
            MAX(s.points) as max_score,
            COUNT(DISTINCT s.participant_id) as participants_count,
            COUNT(DISTINCT s.judge_id) as judges_count
        FROM categories c
        LEFT JOIN scores s ON c.id = s.category_id
        WHERE c.is_active = TRUE
        GROUP BY c.id
        ORDER BY c.weight DESC, c.name ASC
    ";
    
    $stmt = $pdo->query($query);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'categories' => array_map(function($category) {
            return [
                'id' => (int)$category['id'],
                'name' => $category['name'],
                'description' => $category['description'],
                'weight' => (int)$category['weight'],
                'max_points' => (int)$category['max_points'],
                'stats' => [
                    'total_scores' => (int)$category['total_scores'],
                    'average_score' => round(floatval($category['average_score']), 2),
                    'min_score' => $category['min_score'] ? (int)$category['min_score'] : null,
                    'max_score' => $category['max_score'] ? (int)$category['max_score'] : null,
                    'participants_count' => (int)$category['participants_count'],
                    'judges_count' => (int)$category['judges_count']
                ],
                'is_active' => (bool)$category['is_active']
            ];
        }, $categories)
    ], JSON_NUMERIC_CHECK);

} catch (PDOException $e) {
    error_log('Database Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error occurred'
    ]);
}