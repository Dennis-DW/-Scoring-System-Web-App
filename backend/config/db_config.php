<?php
return [
    'host' => getenv('DB_HOST') ?: 'scoringsystem.mysql.database.azure.com',
    'dbname' => getenv('DB_NAME') ?: 'scoring_system',
    'username' => getenv('DB_USERNAME') ?: 'dennys',
    'password' => getenv('DB_PASSWORD') ?: '^*=k.2CK3w!2s2KDUDKD>',
    'port' => (int)(getenv('DB_PORT') ?: 3306),
    'ssl_ca' => getenv('SSL_CA_PATH') ?: __DIR__ . '/DigiCertGlobalRootCA.crt.pem',
   ];