<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TransferRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransferResource;
use App\Models\Transfer;
use App\Models\Wallet;
use App\Services\Transfer\TransferService;
use App\Support\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransferController extends Controller
{
    public function __construct(
        protected TransferService $transferService
    ) {}

    /**
     * POST /api/transfers (Requires Idempotency-Key)
     */
    public function store(TransferRequest $request): JsonResponse
    {
        $user = $request->user();
        $sourceWallet = Wallet::where('id', $request->input('source_wallet_id'))
            ->where('user_id', $user->id)
            ->first();

        if (!$sourceWallet) {
            return ApiResponse::error(
                code: 'INVALID_SOURCE_WALLET',
                message: 'Le portefeuille source est introuvable ou vous n\'en êtes pas le propriétaire.',
                status: 403
            );
        }

        try {
            $result = $this->transferService->executeTransfer(
                sender: $user,
                sourceWallet: $sourceWallet,
                channel: $request->input('channel'),
                recipientIdentifier: $request->input('recipient_identifier'),
                amount: (string) $request->input('amount'),
                recipientName: $request->input('recipient_name'),
                provider: $request->input('provider'),
                reason: $request->input('reason')
            );

            return ApiResponse::success([
                'transaction' => new TransactionResource($result['transaction']),
                'transfer' => new TransferResource($result['transfer']),
                'new_available_balance' => $result['new_balance'],
            ], 'Transfert effectué avec succès', 201);
        } catch (Exception $e) {
            $statusCode = in_array($e->getCode(), [400, 403, 404, 422]) ? $e->getCode() : 400;

            return ApiResponse::error(
                code: 'TRANSFER_FAILED',
                message: $e->getMessage(),
                status: $statusCode
            );
        }
    }

    /**
     * GET /api/transfers
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $transfers = Transfer::with(['transaction.currency', 'sender', 'receiver'])
            ->where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 15));

        return ApiResponse::success([
            'items' => TransferResource::collection($transfers->items()),
            'pagination' => [
                'current_page' => $transfers->currentPage(),
                'last_page' => $transfers->lastPage(),
                'total' => $transfers->total(),
            ]
        ]);
    }
}
