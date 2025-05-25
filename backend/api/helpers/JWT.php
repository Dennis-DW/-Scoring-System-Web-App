<?php
class JWT {
    public static function generate($payload) {
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['exp'] = time() + JWT_EXPIRE;
        $payload = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
        return "$header.$payload.$signature";
    }

    public static function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header, $payload, $signature) = $parts;
        $valid = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
        
        if ($signature !== $valid) return null;

        $payload = json_decode(base64_decode($payload), true);
        if ($payload['exp'] < time()) return null;

        return $payload;
    }
}