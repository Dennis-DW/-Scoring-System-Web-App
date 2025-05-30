<?php
return [
    'host' => getenv('DB_HOST') ?: 'scoringsystem.mysql.database.azure.com',
    'dbname' => getenv('DB_NAME') ?: 'scoring_system',
    'username' => getenv('DB_USERNAME') ?: 'dennys',
    'password' => getenv('DB_PASSWORD') ?: '',
    'port' => (int)(getenv('DB_PORT') ?: 3306),
    'ssl_ca' => getenv('SSL_CA_PATH') ?: __DIR__ . '/DigiCertGlobalRootCA.crt.pem',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 15,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
    ]
];