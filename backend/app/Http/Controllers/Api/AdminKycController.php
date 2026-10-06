<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateKycStatusRequest;
use App\Http\Resources\KycProfileResource;
use App\Models\AuditLog;
use App\Models\KycProfile;
use App\Models\Notification;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminKycController extends Controller
{
    /**
     * GET /api/admin/kyc
     */
    public function index(Request $request): JsonResponse
    {
        $query = KycProfile::with(['user.country', 'documents']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $profiles = $query->orderBy('submitted_at', 'desc')->paginate($request->input('per_page', 20));

        return ApiResponse::success([
            'items' => KycProfileResource::collection($profiles->items()),
            'pagination' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'total' => $profiles->total(),
            ]
        ]);
    }

    /**
     * PATCH /api/admin/kyc/{id}
     */
    public function update(UpdateKycStatusRequest $request, int|string $id): JsonResponse
    {
        $profile = KycProfile::with('user')->findOrFail($id);

        $newStatus = $request->input('status');
        $profile->status = $newStatus;
        if ($request->filled('level')) {
            $profile->level = $request->input('level');
        }
        if ($newStatus === 'verified') {
            $profile->verified_at = now();
            $profile->rejection_reason = null;
        } elseif ($newStatus === 'rejected') {
            $profile->rejection_reason = $request->input('rejection_reason');
        }
        $profile->save();

        // Notify user
        Notification::create([
            'user_id' => $profile->user_id,
            'type' => 'compliance',
            'title' => $newStatus === 'verified' ? 'Identité validée (KYC)' : 'Dossier KYC à corriger',
            'body' => $newStatus === 'verified'
                ? "Félicitations, votre dossier d'identification a été validé. Vos plafonds de virement ont été augmentés."
                : "Votre vérification d'identité requiert votre attention : " . $profile->rejection_reason,
            'data' => ['kyc_status' => $newStatus],
        ]);

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'actor_name' => $request->user()->name,
            'action' => 'KYC_PROFILE_REVIEWED',
            'entity' => 'KycProfile',
            'entity_id' => (string) $profile->id,
            'metadata' => [
                'target_user_id' => $profile->user_id,
                'status' => $newStatus,
                'level' => $profile->level,
            ],
            'created_at' => now(),
        ]);

        return ApiResponse::success(
            new KycProfileResource($profile->fresh(['user.country', 'documents'])),
            "Dossier KYC mis à jour: {$newStatus}"
        );
    }
}
