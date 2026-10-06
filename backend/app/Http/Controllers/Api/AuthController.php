<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Country;
use App\Models\Currency;
use App\Models\Role;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletBalance;
use App\Support\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $country = Country::where('code', $request->input('country_code'))->firstOrFail();
        $clientRole = Role::where('name', 'client')->firstOrFail();

        $rawPhone = $request->input('phone');
        $rawEmail = $request->input('email');
        $isPhone = !empty($rawPhone);
        $sentTo = $isPhone ? $rawPhone : $rawEmail;
        $otpCode = $request->input('otp_code', '123456');

        $user = DB::transaction(function () use ($request, $country, $clientRole, $rawPhone, $rawEmail, $otpCode) {
            $name = $request->input('name');
            $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));

            $email = $rawEmail ?: ($cleanName . '.' . rand(100, 9999) . '@trustlinkbank.africa');
            $phone = $rawPhone ?: ('+237 6' . rand(10000000, 99999999));

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => Hash::make($request->input('password')),
                'country_id' => $country->id,
                'role_id' => $clientRole->id,
                'language' => $request->input('language', 'fr'),
                'status' => 'active',
                'otp_code' => $otpCode,
                'otp_expires_at' => now()->addMinutes(15),
            ]);

            // Provision standard multi-currency wallets (XAF, USD, EUR)
            $currencies = Currency::whereIn('code', ['XAF', 'USD', 'EUR'])->get();
            foreach ($currencies as $currency) {
                $wallet = Wallet::create([
                    'user_id' => $user->id,
                    'currency_id' => $currency->id,
                    'account_number' => 'NP' . $currency->code . '-' . strtoupper(Str::random(8)),
                    'iban' => $currency->code === 'EUR' ? ('FR76' . rand(1000, 9999) . rand(1000, 9999) . rand(1000, 9999) . '01') : null,
                    'bic_swift' => $currency->code === 'EUR' ? 'NOVAFRPPXXX' : null,
                    'status' => 'active',
                ]);

                WalletBalance::create([
                    'wallet_id' => $wallet->id,
                    'available' => '0.0000',
                    'pending' => '0.0000',
                    'last_reconciled_at' => now(),
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth-token')->plainTextToken;

        return ApiResponse::success([
            'user' => new UserResource($user->load(['country', 'role', 'kycProfile'])),
            'token' => $token,
            'token_type' => 'Bearer',
            'otp_code' => $otpCode,
            'otp_sent_to' => $sentTo,
            'channel' => $isPhone ? 'sms' : 'email',
        ], 'Compte créé avec succès', 201);
    }

    /**
     * POST /api/auth/otp/resend
     */
    public function resendOtp(Request $request): JsonResponse
    {
        $identifier = $request->input('identifier');
        $channel = $request->input('channel', 'sms');
        $code = $request->input('code', '123456');

        if ($identifier) {
            $user = User::where('phone', $identifier)
                ->orWhere('email', $identifier)
                ->first();

            if ($user) {
                $user->update([
                    'otp_code' => $code,
                    'otp_expires_at' => now()->addMinutes(15),
                ]);
            }
        }

        return ApiResponse::success([
            'sent' => true,
            'channel' => $channel,
            'identifier' => $identifier,
            'otp_code' => $code,
            'message' => $channel === 'email'
                ? "Code envoyé avec succès par e-mail à {$identifier}."
                : "Code envoyé avec succès par SMS au {$identifier}.",
        ], 'Code OTP envoyé');
    }

    /**
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = $request->input('identifier') ?? $request->input('email');
        $cleanTag = ltrim($identifier, '@');

        $user = User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->orWhere('novatag', '@' . $cleanTag)
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return ApiResponse::error(
                code: 'INVALID_CREDENTIALS',
                message: 'Les identifiants fournis sont incorrects.',
                status: 401
            );
        }

        if ($user->status === 'suspended') {
            return ApiResponse::error(
                code: 'ACCOUNT_SUSPENDED',
                message: 'Votre compte est suspendu. Veuillez contacter le support.',
                status: 403
            );
        }

        $deviceName = $request->input('device_name', $request->userAgent() ?? 'Web Browser');
        $token = $user->createToken($deviceName)->plainTextToken;

        AuditLog::create([
            'actor_id' => $user->id,
            'actor_name' => $user->name,
            'action' => 'USER_LOGIN',
            'entity' => 'User',
            'entity_id' => (string) $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return ApiResponse::success([
            'user' => new UserResource($user->load(['country', 'role', 'kycProfile'])),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Connexion réussie');
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return ApiResponse::success(null, 'Déconnexion effectuée');
    }

    /**
     * POST /api/auth/otp/verify
     * Accepts demo code (123456), any 6-digit code, or the generated code
     */
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $identifier = $request->input('identifier');
        $code = $request->input('code');

        $user = User::where('phone', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        // Simulated OTP verification: accept fixed demo code '123456' or any 6-digit valid code
        $isValidOtp = ($code === '123456') || (strlen($code) === 6 && ctype_digit($code));

        if (!$isValidOtp) {
            return ApiResponse::error(
                code: 'INVALID_OTP',
                message: 'Le code de vérification est invalide ou expiré.',
                status: 422
            );
        }

        if ($user) {
            $user->update(['phone_verified_at' => now()]);
            $token = $user->createToken('otp-verified')->plainTextToken;

            return ApiResponse::success([
                'user' => new UserResource($user->load(['country', 'role', 'kycProfile'])),
                'token' => $token,
                'verified' => true,
            ], 'Vérification OTP réussie');
        }

        return ApiResponse::success([
            'verified' => true,
            'message' => 'Code vérifié avec succès.',
        ]);
    }

    /**
     * POST /api/auth/password/forgot
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        // Simulated password reset
        return ApiResponse::success([
            'simulated_sms_sent' => true,
            'demo_code' => '123456',
        ], 'Un code de réinitialisation a été envoyé par SMS.');
    }
}
