<?php
try {
    $serverName = "tcp:sowerved.database.windows.net,1433";
    $database = "scoring_system";
    $username = "sowerved-default";
    $password = getenv('DB_PASSWORD'); // Securely stored in Azure App Settings

    $dsn = "sqlsrv:server=$serverName;Database=$database";
    $conn = new PDO($dsn, $username, $password);

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connection successful.";
} catch (PDOException $e) {
    echo "Error connecting to SQL Server: " . $e->getMessage();
}
?>
