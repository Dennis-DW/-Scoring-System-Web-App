<?php
function connectDB($maxRetries = 5) {
    $config = require __DIR__ . '/db_config.php';

    // Comment out or remove debugging in production
    /* 
    echo "Resolving hostname: {$config['host']}\n";
    $resolvedIP = gethostbyname($config['host']);
    echo "Resolved IP: {$resolvedIP}\n";

    echo "Checking MySQL port {$config['port']}...\n";
    $fp = @fsockopen($config['host'], $config['port'], $errno, $errstr, 5);
    if (!$fp) {
        echo "Port closed or unreachable: $errstr ($errno)\n";
    } else {
        echo "Port open. Able to connect to MySQL port.\n";
        fclose($fp);
    }
    */

    $attempt = 0;
    while ($attempt < $maxRetries) {
        try {
            $dsn = sprintf("mysql:host=%s;dbname=%s;port=%d;charset=utf8mb4",
                $config['host'],
                $config['dbname'],
                $config['port']
            );

            // Proper options for Azure MySQL with SSL
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 15,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_PERSISTENT => true,
                PDO::MYSQL_ATTR_SSL_CA => $config['ssl_ca'],
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
            ];

            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            $pdo->query('SELECT 1');
            error_log("Database connection established successfully");
            return $pdo;

        } catch(PDOException $e) {
            $attempt++;
            error_log(sprintf(
                "Database connection attempt %d/%d failed: %s",
                $attempt,
                $maxRetries,
                $e->getMessage()
            ));
            if ($attempt >= $maxRetries) {
                // For API responses, return JSON error instead of dying
                if (strpos($_SERVER['SCRIPT_NAME'], '/api/') !== false) {
                    header('Content-Type: application/json');
                    echo json_encode(['error' => 'Database connection failed', 'status' => 503]);
                    exit;
                } else {
                    throw new PDOException("Database connection failed after {$maxRetries} attempts: " . $e->getMessage());
                }
            }
            sleep(2);
        }
    }
}

// Only directly connect when script is run directly (not when included)
if (basename($_SERVER['SCRIPT_FILENAME']) == basename(__FILE__)) {
    try {
        $pdo = connectDB();
        echo "Connected successfully\n";
    } catch (PDOException $e) {
        echo $e->getMessage() . "\n";
        exit(1);
    }
}