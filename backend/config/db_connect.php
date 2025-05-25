<?php
function connectDB() {
    $config = require __DIR__ . '/db_config.php';
    
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['dbname']}",
            $config['username'],
            $config['password']
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "Connected successfully\n";
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage() . "\n");
    }
}

connectDB();