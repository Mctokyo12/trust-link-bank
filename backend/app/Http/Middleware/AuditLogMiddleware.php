<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log write operations in admin or sensitive areas
        if ($request->is('api/admin*') && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $user = $request->user();

            AuditLog::create([
                'actor_id' => $user?->id,
                'actor_name' => $user?->name ?? 'System',
                'action' => 'ADMIN_ACTION_' . strtoupper($request->method()),
                'entity' => explode('/', trim($request->path(), '/'))[2] ?? 'Resource',
                'entity_id' => $request->route('id') ?? $request->input('id'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'path' => $request->path(),
                    'method' => $request->method(),
                    'status' => $response->getStatusCode(),
                    'payload' => $this->sanitizePayload($request->except(['password', 'password_confirmation', 'token'])),
                ],
                'created_at' => now(),
            ]);
        }

        return $response;
    }

    protected function sanitizePayload(array $payload): array
    {
        return array_map(function ($value) {
            if (is_array($value)) {
                return $this->sanitizePayload($value);
            }
            return $value;
        }, $payload);
    }
}
