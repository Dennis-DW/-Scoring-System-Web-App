<?php
function connectDB($maxRetries = 5) {
    $config = require __DIR__ . '/db_config.php';
    
    $attempt = 0;
    while ($attempt < $maxRetries) {
        try {
            $dsn = sprintf("mysql:host=%s;dbname=%s;port=%d;charset=utf8mb4",
                $config['host'],
                $config['dbname'],
                $config['port']
            );

            $options = [
                PDO::MYSQL_ATTR_SSL_CA => $config['ssl_ca'],
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true, // Try enabling verification
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 15, // Increased timeout
                PDO::ATTR_PERSISTENT => false
            ];

            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            $pdo->query('SELECT 1');
            error_log("Connected successfully to database: " . $config['host']);
            echo "Connected successfully\n";
            return $pdo;
            
        } catch(PDOException $e) {
            $attempt++;
            error_log(sprintf(
                "Attempt %d/%d failed: %s\nDSN: %s\nTrace: %s",
                $attempt,
                $maxRetries,
                $e->getMessage(),
                $dsn,
                $e->getTraceAsString()
            ));
            if ($attempt >= $maxRetries) {
                die("Connection failed after {$maxRetries} attempts. Check error log for details.\n");
            }
            sleep(3); // Increased delay
        }
    }
}

connectDB();