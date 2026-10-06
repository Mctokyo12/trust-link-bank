<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * GET /api/admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['country', 'role', 'kycProfile']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('role')) {
            $query->whereHas('role', fn($q) => $q->where('name', $request->input('role')));
        }
        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('novatag', 'like', "%{$s}%");
            });
        }

        $users = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 20));

        return ApiResponse::success([
            'items' => UserResource::collection($users->items()),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * PATCH /api/admin/users/{id}
     */
    public function updateStatus(UpdateUserStatusRequest $request, int|string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $oldStatus = $user->status;
        $newStatus = $request->input('status');

        $user->update(['status' => $newStatus]);

        AuditLog::create([
            'actor_id' => $request->user()->id,
            'actor_name' => $request->user()->name,
            'action' => 'USER_STATUS_UPDATED',
            'entity' => 'User',
            'entity_id' => (string) $user->id,
            'metadata' => [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $request->input('reason'),
            ],
            'created_at' => now(),
        ]);

        return ApiResponse::success(
            new UserResource($user->fresh(['country', 'role', 'kycProfile'])),
            "Statut utilisateur mis à jour: {$newStatus}"
        );
    }
}
