<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ApiResponse
{
    /**
     * Standard success JSON response
     */
    public static function success(mixed $data = null, string $message = 'Success', int $status = 200, array $headers = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        return response()->json($response, $status, $headers);
    }

    /**
     * Strictly formatted error JSON response matching project requirements:
     * {
     *   "error": {
     *     "code": "string",
     *     "message": "human-readable message",
     *     "details": {},
     *     "reference": "server-side trace id"
     *   }
     * }
     */
    public static function error(
        string $code,
        string $message,
        array|object $details = [],
        int $status = 400,
        ?string $reference = null
    ): JsonResponse {
        $traceId = $reference ?? ('NP-ERR-' . strtoupper(Str::random(12)));

        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
                'details' => (object) $details,
                'reference' => $traceId,
            ]
        ], $status);
    }
}
