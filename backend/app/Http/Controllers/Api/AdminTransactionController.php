<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionController extends Controller
{
    /**
     * GET /api/admin/transactions
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['currency', 'transfer.sender', 'transfer.receiver', 'entries.wallet.user']);

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->filled('currency')) {
            $query->whereHas('currency', fn($q) => $q->where('code', $request->input('currency')));
        }
        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where('reference', 'like', "%{$s}%")->orWhere('description', 'like', "%{$s}%");
        }

        $transactions = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 25));

        return ApiResponse::success([
            'items' => TransactionResource::collection($transactions->items()),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }
}
