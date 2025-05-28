<?php
return [
    'serverName' => "tcp:sowerved.database.windows.net,1433",
    'database' => "scoring_system",
    'username' => "sowerved-default",
    'password' => getenv('DB_PASSWORD'),
];