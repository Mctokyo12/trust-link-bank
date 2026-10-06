<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WalletResource;
use App\Models\Wallet;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * GET /api/wallets
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallets = Wallet::with(['currency', 'balanceProjection'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'asc')
            ->get();

        return ApiResponse::success(WalletResource::collection($wallets));
    }

    /**
     * GET /api/wallets/{id}
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        // Support lookup by integer ID or UUID
        $wallet = Wallet::with(['currency', 'balanceProjection'])
            ->where('user_id', $user->id)
            ->where(function ($query) use ($id) {
                $query->where('id', $id)->orWhere('uuid', $id);
            })
            ->first();

        if (!$wallet) {
            return ApiResponse::error(
                code: 'WALLET_NOT_FOUND',
                message: 'Le portefeuille demandé est introuvable ou ne vous appartient pas.',
                status: 404
            );
        }

        return ApiResponse::success(new WalletResource($wallet));
    }
}
