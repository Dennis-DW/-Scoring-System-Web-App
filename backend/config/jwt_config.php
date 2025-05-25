<?php
// config/jwt_config.php
define('JWT_SECRET', bin2hex(random_bytes(32)));
define('JWT_EXPIRE', 3600);
define('REFRESH_TOKEN_EXPIRE', 604800);
