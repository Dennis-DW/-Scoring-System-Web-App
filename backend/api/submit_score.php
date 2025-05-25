<?php

require '/../config/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

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
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit();
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Verify judge exists and is active
    $stmt = $pdo->prepare('SELECT id FROM judges WHERE id = ? AND is_active = TRUE');
    $stmt->execute([$judge_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Invalid or inactive judge');
    }

    // Verify participant exists and is active
    $stmt = $pdo->prepare('SELECT id FROM participants WHERE id = ? AND is_active = TRUE');
    $stmt->execute([$participant_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Invalid or inactive participant');
    }

    // Verify category exists
    $stmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
    $stmt->execute([$category_id]);
    if (!$stmt->fetch()) {
        throw new Exception('Invalid category');
    }

    // Insert or update score
    $stmt = $pdo->prepare('
        INSERT INTO scores (judge_id, participant_id, category_id, points, comments) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            points = VALUES(points),
            comments = VALUES(comments),
            created_at = CURRENT_TIMESTAMP
    ');
    $stmt->execute([$judge_id, $participant_id, $category_id, $points, $comments]);

    // Get updated participant scores
    $stmt = $pdo->prepare('
        SELECT 
            AVG(points) as average_score,
            COUNT(DISTINCT judge_id) as judges_count
        FROM scores 
        WHERE participant_id = ?
    ');
    $stmt->execute([$participant_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Score submitted successfully',
        'stats' => [
            'average_score' => round($stats['average_score'], 2),
            'judges_count' => (int)$stats['judges_count']
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to submit score',
        'message' => $e->getMessage()
    ]);
}
?>