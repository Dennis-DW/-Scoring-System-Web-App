<?php
// api/submit_score.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); 


header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo = connectDB();
    $pdo->beginTransaction();

    // Validate input data
    $judge_id = filter_var($data['judge_id'] ?? '', FILTER_VALIDATE_INT);
    $participant_id = filter_var($data['participant_id'] ?? '', FILTER_VALIDATE_INT);
    $category_id = filter_var($data['category_id'] ?? '', FILTER_VALIDATE_INT);
    $points = filter_var($data['points'] ?? '', FILTER_VALIDATE_INT);
    $comments = trim($data['comments'] ?? '');

    // Validation checks
    $errors = [];
    if (!$judge_id) $errors['judge_id'] = 'Valid judge ID is required';
    if (!$participant_id) $errors['participant_id'] = 'Valid participant ID is required';
    if (!$category_id) $errors['category_id'] = 'Valid category ID is required';
    if (!$points || $points < 1 || $points > 100) {
        $errors['points'] = 'Points must be between 1 and 100';
    }

    if (!empty($errors)) {
        throw new Exception(json_encode($errors), 400);
    }

    // Check judge
    $stmt = $pdo->prepare('
        SELECT j.id, j.role_id, r.name as role_name 
        FROM judges j 
        JOIN roles r ON j.role_id = r.id 
        WHERE j.id = ? AND j.is_active = TRUE
    ');
    $stmt->execute([$judge_id]);
    $judge = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$judge) {
        throw new Exception('Invalid or inactive judge');
    }

    // Check participant
    $stmt = $pdo->prepare('
        SELECT id, name, registration_number 
        FROM participants 
        WHERE id = ? AND is_active = TRUE
    ');
    $stmt->execute([$participant_id]);
    $participant = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$participant) {
        throw new Exception('Invalid or inactive participant');
    }

    // Check category
    $stmt = $pdo->prepare('
        SELECT id, name, weight, max_points 
        FROM categories 
        WHERE id = ? AND is_active = TRUE
    ');
    $stmt->execute([$category_id]);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        throw new Exception('Invalid or inactive category');
    }

    // Submit or update score
    $stmt = $pdo->prepare('
        INSERT INTO scores (
            judge_id,
            participant_id,
            category_id,
            points,
            comments,
            created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            points = VALUES(points),
            comments = VALUES(comments),
            updated_at = NOW()
    ');
    
    $stmt->execute([
        $judge_id,
        $participant_id,
        $category_id,
        $points,
        $comments
    ]);

    $scoreId = $pdo->lastInsertId();
    $action = $scoreId ? 'INSERT' : 'UPDATE';

    // Log to audit trail
    $stmt = $pdo->prepare('
        INSERT INTO audit_trail (
            table_name,
            record_id,
            action,
            changed_by,
            changes
        ) VALUES (?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        'scores',
        $scoreId ?: $pdo->query("SELECT id FROM scores WHERE judge_id = $judge_id AND participant_id = $participant_id AND category_id = $category_id")->fetchColumn(),
        $action,
        $judge_id,
        json_encode([
            'points' => $points,
            'category' => $category['name'],
            'participant' => $participant['name'],
            'comments' => $comments
        ])
    ]);

    // Get updated statistics
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(*) as total_scores,
            ROUND(AVG(points), 2) as average_score,
            COUNT(DISTINCT judge_id) as judges_count,
            COUNT(DISTINCT category_id) as categories_scored,
            MIN(points) as min_score,
            MAX(points) as max_score
        FROM scores 
        WHERE participant_id = ?
    ');
    $stmt->execute([$participant_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Score {$action}ED successfully",
        'score' => [
            'id' => $scoreId,
            'points' => $points,
            'weighted_points' => $points * $category['weight'],
            'category' => $category['name'],
            'comments' => $comments
        ],
        'participant' => [
            'id' => $participant_id,
            'name' => $participant['name'],
            'registration' => $participant['registration_number'],
            'stats' => [
                'total_scores' => (int)$stats['total_scores'],
                'average_score' => round((float)$stats['average_score'], 2),
                'judges_count' => (int)$stats['judges_count'],
                'categories_scored' => (int)$stats['categories_scored'],
                'score_range' => [
                    'min' => (int)$stats['min_score'],
                    'max' => (int)$stats['max_score']
                ]
            ]
        ]
    ], JSON_NUMERIC_CHECK);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $code = $e->getCode() ?: 500;
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $code === 400 ? json_decode($e->getMessage(), true) : 'Failed to submit score',
        'message' => $code !== 400 ? $e->getMessage() : null
    ]);
}