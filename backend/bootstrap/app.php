<?php

use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\IdempotencyMiddleware;
use App\Http\Middleware\RequireRoleMiddleware;
use App\Support\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'idempotency' => IdempotencyMiddleware::class,
            'audit' => AuditLogMiddleware::class,
            'role' => RequireRoleMiddleware::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Enforce consistent error format across all endpoints per specification
        $exceptions->render(function (ValidationException $e, Request $request) {
            return ApiResponse::error(
                code: 'VALIDATION_ERROR',
                message: 'Les données transmises sont invalides.',
                details: $e->errors(),
                status: 422
            );
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return ApiResponse::error(
                code: 'RESOURCE_NOT_FOUND',
                message: 'La ressource demandée est introuvable.',
                status: 404
            );
        });

        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            return ApiResponse::error(
                code: 'FORBIDDEN',
                message: $e->getMessage() ?: 'Accès non autorisé.',
                status: 403
            );
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            return ApiResponse::error(
                code: 'UNAUTHENTICATED',
                message: 'Non authentifié. Jeton d\'accès invalide ou manquant.',
                status: 401
            );
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
                return ApiResponse::error(
                    code: 'SERVER_ERROR',
                    message: config('app.debug') ? $e->getMessage() : 'Une erreur inattendue est survenue.',
                    details: config('app.debug') ? ['file' => $e->getFile(), 'line' => $e->getLine()] : [],
                    status: $code
                );
            }
        });
    })->create();
