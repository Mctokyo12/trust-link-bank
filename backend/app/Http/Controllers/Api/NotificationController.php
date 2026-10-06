<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 20));

        $unreadCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return ApiResponse::success([
            'items' => NotificationResource::collection($notifications->items()),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     */
    public function markAsRead(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        if ($id === 'all') {
            Notification::where('user_id', $user->id)->whereNull('read_at')->update(['read_at' => now()]);
            return ApiResponse::success(null, 'Toutes les notifications ont été marquées comme lues.');
        }

        $notification = Notification::where('user_id', $user->id)->where('id', $id)->first();

        if (!$notification) {
            return ApiResponse::error(
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification introuvable.',
                status: 404
            );
        }

        $notification->update(['read_at' => now()]);

        return ApiResponse::success(new NotificationResource($notification), 'Notification marquée comme lue.');
    }
}
