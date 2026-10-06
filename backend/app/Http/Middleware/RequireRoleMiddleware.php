<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return ApiResponse::error(
                code: 'UNAUTHENTICATED',
                message: "Authentication is required to access this resource.",
                status: 401
            );
        }

        if (!empty($roles) && !$user->hasRole($roles)) {
            return ApiResponse::error(
                code: 'FORBIDDEN',
                message: "You do not have the required permissions to access this administrative endpoint.",
                details: ['required_roles' => $roles, 'your_role' => $user->role?->name],
                status: 403
            );
        }

        return $next($request);
    }
}
