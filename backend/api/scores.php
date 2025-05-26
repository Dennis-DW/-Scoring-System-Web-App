<?php
// Set headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit();
}

try {
    $pdo = connectDB();
    // Check MySQL version for JSON functions
    $version = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    $useJSON = version_compare($version, '5.7.0', '>=');

    // Modify query based on MySQL version
    $categoryScoresQuery = $useJSON ? 
        "(SELECT JSON_ARRAYAGG(JSON_OBJECT('category_id', s2.category_id, 'points', s2.points)) 
          FROM scores s2 WHERE s2.participant_id = p.id)" :
        "GROUP_CONCAT(CONCAT(s2.category_id, ':', s2.points))";

    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.name,
            p.email,
            COUNT(DISTINCT s.judge_id) as number_of_judges,
            COUNT(s.id) as total_scores,
            COALESCE(AVG(s.points), 0) as average_score,
            COALESCE(SUM(s.points), 0) as total_points,
            MAX(s.created_at) as last_scored,
            $categoryScoresQuery as category_scores
        FROM participants p 
        LEFT JOIN scores s ON p.id = s.participant_id
        WHERE p.is_active = TRUE
        GROUP BY p.id, p.name
        ORDER BY average_score DESC, total_scores DESC
    ");
    
    $stmt->execute();
    $scores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format scores
    $formattedScores = array_map(function($score) use ($useJSON) {
        $categoryScores = $useJSON ? 
            json_decode($score['category_scores'] ?? '[]') :
            array_map(function($item) {
                list($category_id, $points) = explode(':', $item);
                return ['category_id' => $category_id, 'points' => $points];
            }, $score['category_scores'] ? explode(',', $score['category_scores']) : []);

        return [
            'id' => (int)$score['id'],
            'name' => $score['name'],
            'email' => $score['email'],
            'stats' => [
                'average_score' => round($score['average_score'], 2),
                'total_points' => (int)$score['total_points'],
                'number_of_judges' => (int)$score['number_of_judges'],
                'total_scores' => (int)$score['total_scores'],
                'last_scored' => $score['last_scored'] ? date('Y-m-d H:i:s', strtotime($score['last_scored'])) : null
            ],
            'category_scores' => $categoryScores
        ];
    }, $scores);
    
    echo json_encode([
        'success' => true,
        'count' => count($formattedScores),
        'timestamp' => date('Y-m-d H:i:s'),
        'scores' => $formattedScores
    ]);

} catch (PDOException $e) {
    error_log("Database error in scores.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
} catch (Exception $e) {
    error_log("Server error in scores.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error'
    ]);
}
