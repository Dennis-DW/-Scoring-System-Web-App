<?php
header('Content-Type: application/json');
// header("Access-Control-Allow-Origin: https://white-meadow-0c5eba71e.6.azurestaticapps.net");

function getDbConnection() {
    try {
        $serverName = "tcp:sowerved.database.windows.net,1433";
        $database = "scoring_system";
        $username = "sowerved-default";
        $password = getenv('DB_PASSWORD');

        // Connection options for security and performance
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 30,
            PDO::SQLSRV_ATTR_ENCODING => PDO::SQLSRV_ENCODING_UTF8,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true // Connection pooling
        ];

        $dsn = "sqlsrv:server=$serverName;Database=$database;TrustServerCertificate=1";
        $conn = new PDO($dsn, $username, $password, $options);

        return [
            'success' => true,
            'message' => 'Connection successful',
            'connection' => $conn
        ];
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        http_response_code(500);
        return [
            'success' => false,
            'error' => 'Database connection failed',
            'details' => $e->getMessage()
        ];
    }
}

// Usage
$result = getDbConnection();
echo json_encode($result, JSON_PRETTY_PRINT);
?>
