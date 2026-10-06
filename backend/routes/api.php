<?php

use App\Http\Controllers\Api\AdminAuditLogController;
use App\Http\Controllers\Api\AdminExchangeRateController;
use App\Http\Controllers\Api\AdminFeeController;
use App\Http\Controllers\Api\AdminKycController;
use App\Http\Controllers\Api\AdminTransactionController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BeneficiaryController;
use App\Http\Controllers\Api\ExchangeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\IdempotencyMiddleware;
use App\Http\Middleware\RequireRoleMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Trust Link Bank Africa Digital Banking
|--------------------------------------------------------------------------
*/

// Public Authentication Endpoints (Rate Limited)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:15,1');
    Route::post('/otp/resend', [AuthController::class, 'resendOtp'])->middleware('throttle:15,1');
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
});

// Public Rates Listing
Route::get('/exchange-rates', [ExchangeController::class, 'rates']);

// Authenticated Endpoints (Sanctum Token Auth)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth session
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // User Profile & Devices
    Route::get('/me', [UserController::class, 'me']);
    Route::patch('/me', [UserController::class, 'update']);
    Route::get('/me/sessions', [UserController::class, 'sessions']);
    Route::delete('/me/sessions/{id}', [UserController::class, 'destroySession']);

    // Wallets
    Route::get('/wallets', [WalletController::class, 'index']);
    Route::get('/wallets/{id}', [WalletController::class, 'show']);

    // Financial Transfers (Enforced Idempotency)
    Route::middleware([IdempotencyMiddleware::class])->group(function () {
        Route::post('/transfers', [TransferController::class, 'store']);
        Route::post('/exchange/execute', [ExchangeController::class, 'execute']);
    });
    Route::get('/transfers', [TransferController::class, 'index']);

    // Exchange
    Route::post('/exchange/quote', [ExchangeController::class, 'quote']);

    // Transactions History & Ledger Proofs
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    // Beneficiaries
    Route::get('/beneficiaries', [BeneficiaryController::class, 'index']);
    Route::post('/beneficiaries', [BeneficiaryController::class, 'store']);
    Route::delete('/beneficiaries/{id}', [BeneficiaryController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Administrative Endpoints (Gated by Role & Auto-Audit-Logged)
    Route::prefix('admin')
        ->middleware([
            RequireRoleMiddleware::class . ':support,administrateur,super_administrateur',
            AuditLogMiddleware::class
        ])
        ->group(function () {
            // User Management
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::patch('/users/{id}', [AdminUserController::class, 'updateStatus'])
                ->middleware(RequireRoleMiddleware::class . ':administrateur,super_administrateur');

            // Transactions Audit
            Route::get('/transactions', [AdminTransactionController::class, 'index']);

            // Exchange Rates Management
            Route::get('/exchange-rates', [AdminExchangeRateController::class, 'index']);
            Route::post('/exchange-rates', [AdminExchangeRateController::class, 'store'])
                ->middleware(RequireRoleMiddleware::class . ':administrateur,super_administrateur');
            Route::patch('/exchange-rates/{id}', [AdminExchangeRateController::class, 'update'])
                ->middleware(RequireRoleMiddleware::class . ':administrateur,super_administrateur');

            // Fee Schedules
            Route::get('/fees', [AdminFeeController::class, 'index']);
            Route::post('/fees', [AdminFeeController::class, 'store'])
                ->middleware(RequireRoleMiddleware::class . ':administrateur,super_administrateur');
            Route::patch('/fees/{id}', [AdminFeeController::class, 'update'])
                ->middleware(RequireRoleMiddleware::class . ':administrateur,super_administrateur');

            // Compliance & KYC
            Route::get('/kyc', [AdminKycController::class, 'index']);
            Route::patch('/kyc/{id}', [AdminKycController::class, 'update']);

            // Security Audit Logs
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])
                ->middleware(RequireRoleMiddleware::class . ':super_administrateur');
        });
});
