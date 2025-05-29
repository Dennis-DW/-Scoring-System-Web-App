<?php
function connectDB($maxRetries = 3) {
    $config = require __DIR__ . '/db_config.php';
    
    $attempt = 0;
    while ($attempt < $maxRetries) {
        try {
            // Build DSN string with charset
            $dsn = sprintf("mysql:host=%s;dbname=%s;port=%d;charset=utf8mb4",
                $config['host'],
                $config['dbname'],
                $config['port']
            );

            // Connection options
            $options = [
                PDO::MYSQL_ATTR_SSL_CA => $config['ssl_ca'],
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
                PDO::ATTR_PERSISTENT => false
            ];

            // Create PDO connection
            $pdo = new PDO($dsn, $config['username'], $config['password'], $options);
            
            // Validate connection
            $pdo->query('SELECT 1');
            
            echo "Connected successfully\n";
            return $pdo;
            
        } catch(PDOException $e) {
            $attempt++;
            if ($attempt >= $maxRetries) {
                error_log(sprintf(
                    "Database connection failed: %s\nTrace: %s", 
                    $e->getMessage(),
                    $e->getTraceAsString()
                ));
                die("Connection failed after {$maxRetries} attempts. Check error log for details.\n");
            }
            sleep(2); // Wait before retry
        }
    }
}

connectDB();