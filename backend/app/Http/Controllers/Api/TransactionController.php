<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * GET /api/transactions (filters: type, currency, status, date range; search by reference; paginated)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userWalletIds = Wallet::where('user_id', $user->id)->pluck('id');

        $query = Transaction::with(['currency', 'transfer.sender', 'transfer.receiver', 'entries'])
            ->whereHas('entries', function ($q) use ($userWalletIds) {
                $q->whereIn('wallet_id', $userWalletIds);
            });

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by currency
        if ($request->filled('currency')) {
            $query->whereHas('currency', function ($q) use ($request) {
                $q->where('code', $request->input('currency'));
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Search by reference
        if ($request->filled('search') || $request->filled('reference')) {
            $search = $request->input('search') ?? $request->input('reference');
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $transactions = $query->orderBy('id', 'desc')->paginate($perPage);

        return ApiResponse::success([
            'items' => TransactionResource::collection($transactions->items()),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }

    /**
     * GET /api/transactions/{id}
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $userWalletIds = Wallet::where('user_id', $user->id)->pluck('id');

        $transaction = Transaction::with(['currency', 'transfer.sender', 'transfer.receiver', 'entries'])
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('reference', $id);
            })
            ->whereHas('entries', function ($q) use ($userWalletIds) {
                $q->whereIn('wallet_id', $userWalletIds);
            })
            ->first();

        if (!$transaction) {
            return ApiResponse::error(
                code: 'TRANSACTION_NOT_FOUND',
                message: 'Transaction introuvable ou non autorisée.',
                status: 404
            );
        }

        return ApiResponse::success(new TransactionResource($transaction));
    }
}
