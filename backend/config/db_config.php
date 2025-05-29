<?php
// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            putenv(sprintf('%s=%s', trim($key), trim($value)));
        }
    }
}

return [
    'host' => getenv('DB_HOST') ?: 'scoringsystem.mysql.database.azure.com',
    'dbname' => getenv('DB_NAME') ?: 'scoring_system',
    'username' => getenv('DB_USERNAME') ?: 'dennys',
    'password' => getenv('DB_PASSWORD') ?: '^*=k.2CK3w!2s2KDUDKD>',
    'port' => (int)(getenv('DB_PORT') ?: 3306),
    'ssl_ca' => __DIR__ . (getenv('SSL_CA_PATH') ?: '/DigiCertGlobalRootCA.crt.pem'),
    'options' => [
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => true,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]
];