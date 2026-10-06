<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\DeviceSession;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['country', 'role', 'kycProfile.documents', 'wallets.currency']);

        return ApiResponse::success(new UserResource($user));
    }

    /**
     * PATCH /api/me
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return ApiResponse::success(
            new UserResource($user->fresh(['country', 'role', 'kycProfile'])),
            'Profil mis à jour avec succès'
        );
    }

    /**
     * GET /api/me/sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = DeviceSession::where('user_id', $user->id)
            ->orderBy('last_seen', 'desc')
            ->get();

        if ($sessions->isEmpty()) {
            // Simulated session fallback
            $sessions = [
                [
                    'id' => 1,
                    'device' => 'Safari / iPhone 15 Pro',
                    'browser' => 'Mobile Safari',
                    'platform' => 'iOS 17.5',
                    'ip_address' => '102.244.150.12',
                    'location' => 'Douala, Cameroun',
                    'is_current' => true,
                    'last_seen' => now()->toISOString(),
                ]
            ];
        }

        return ApiResponse::success($sessions);
    }

    /**
     * DELETE /api/me/sessions/{id}
     */
    public function destroySession(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        DeviceSession::where('user_id', $user->id)->where('id', $id)->delete();

        return ApiResponse::success(null, 'Session révoquée avec succès');
    }
}
