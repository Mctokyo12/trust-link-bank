<?php

return [
    'name' => env('APP_NAME', 'Trust Link Bank'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8000'),
    'timezone' => env('APP_TIMEZONE', 'UTC'),
    'locale' => env('APP_LOCALE', 'fr'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
    'faker_locale' => 'fr_FR',
    'key' => env('APP_KEY', 'base64:XG8d2Lg9y5M4P3k7W1z0R9t6Q2j8F4v1A7s3D5g6H8k='),
    'cipher' => 'AES-256-CBC',
];
