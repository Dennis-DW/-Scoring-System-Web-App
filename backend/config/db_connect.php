<?php
function connectDB() {
    $config = require __DIR__ . '/db_config.php';
    $retries = 3;
    $retry_delay = 2; // seconds
    
    $dsn = "sqlsrv:Server={$config['serverName']};Database={$config['database']};";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::SQLSRV_ATTR_ENCODING => PDO::SQLSRV_ENCODING_UTF8,
        PDO::ATTR_TIMEOUT => 30, // seconds
    ];

    for ($i = 0; $i < $retries; $i++) {
        try {
            $pdo = new PDO(
                $dsn,
                $config['username'],
                $config['password'],
                $options
            );
            return $pdo;
        } catch (PDOException $e) {
            $last_error = $e->getMessage();
            if ($i < $retries - 1) {
                sleep($retry_delay);
                continue;
            }
            throw new Exception("Database connection failed after {$retries} attempts: {$last_error}");
        }
    }
}

// Usage
try {
    $db = connectDB();
} catch (Exception $e) {
    header('HTTP/1.1 503 Service Unavailable');
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}