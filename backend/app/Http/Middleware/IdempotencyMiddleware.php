<?php

namespace App\Http\Middleware;

use App\Models\IdempotencyKey;
use App\Support\ApiResponse;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdempotencyMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        if (!$idempotencyKey) {
            // Only require on financial write endpoints
            if ($request->is('api/transfers*') || $request->is('api/exchange/execute*')) {
                return ApiResponse::error(
                    code: 'MISSING_IDEMPOTENCY_KEY',
                    message: "An 'Idempotency-Key' header is required for this financial transaction.",
                    details: ['header' => 'Idempotency-Key'],
                    status: 400
                );
            }

            return $next($request);
        }

        $userId = $request->user()?->id;
        $requestHash = hash('sha256', $request->path() . '|' . json_encode($request->all()) . '|' . ($userId ?? 'guest'));

        // Check if idempotency key already exists in DB
        $existing = IdempotencyKey::where('key', $idempotencyKey)->first();

        if ($existing) {
            // Verify request integrity
            if ($existing->request_hash !== $requestHash) {
                return ApiResponse::error(
                    code: 'IDEMPOTENCY_KEY_MISMATCH',
                    message: "The Idempotency-Key has already been used for a different request payload.",
                    status: 409
                );
            }

            if ($existing->response_code !== null && $existing->response_body !== null) {
                return response()->json($existing->response_body, $existing->response_code, [
                    'X-Cache-Lookup' => 'HIT-IDEMPOTENT',
                ]);
            }

            return ApiResponse::error(
                code: 'TRANSACTION_IN_PROGRESS',
                message: "A transaction with this Idempotency-Key is currently being processed.",
                status: 409
            );
        }

        // Reserve key in DB
        try {
            $record = IdempotencyKey::create([
                'key' => $idempotencyKey,
                'user_id' => $userId,
                'path' => $request->path(),
                'request_hash' => $requestHash,
                'expires_at' => now()->addDays(7),
            ]);
        } catch (Exception $e) {
            return ApiResponse::error(
                code: 'DUPLICATE_IDEMPOTENCY_KEY',
                message: "This Idempotency-Key is already reserved.",
                status: 409
            );
        }

        /** @var Response $response */
        $response = $next($request);

        // Store the response for future retries if successful or valid JSON
        if ($response->getStatusCode() < 500) {
            $content = json_decode($response->getContent(), true);
            $record->update([
                'response_code' => $response->getStatusCode(),
                'response_body' => $content,
                'transaction_reference' => $content['data']['transaction']['reference'] ?? null,
            ]);
        } else {
            // Remove reservation on unhandled 500 server crashes so client can retry safely
            $record->delete();
        }

        return $response;
    }
}
