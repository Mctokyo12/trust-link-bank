<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExchangeExecuteRequest;
use App\Http\Requests\ExchangeQuoteRequest;
use App\Http\Resources\ExchangeRateResource;
use App\Http\Resources\TransactionResource;
use App\Models\ExchangeRate;
use App\Models\Wallet;
use App\Services\Exchange\ExchangeService;
use App\Support\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExchangeController extends Controller
{
    public function __construct(
        protected ExchangeService $exchangeService
    ) {}

    /**
     * POST /api/exchange/quote
     */
    public function quote(ExchangeQuoteRequest $request): JsonResponse
    {
        $quote = $this->exchangeService->generateQuote(
            fromCurrencyCode: $request->input('from_currency'),
            toCurrencyCode: $request->input('to_currency'),
            fromAmount: (string) $request->input('from_amount')
        );

        return ApiResponse::success($quote, 'Devis de change garanti pour 60 secondes');
    }

    /**
     * POST /api/exchange/execute (Requires Idempotency-Key)
     */
    public function execute(ExchangeExecuteRequest $request): JsonResponse
    {
        $user = $request->user();

        $sourceWallet = Wallet::with('currency')
            ->where('id', $request->input('source_wallet_id'))
            ->where('user_id', $user->id)
            ->first();

        $destWallet = Wallet::with('currency')
            ->where('id', $request->input('destination_wallet_id'))
            ->where('user_id', $user->id)
            ->first();

        if (!$sourceWallet || !$destWallet) {
            return ApiResponse::error(
                code: 'INVALID_WALLETS',
                message: 'Les portefeuilles source et de destination doivent exister et vous appartenir.',
                status: 403
            );
        }

        try {
            $result = $this->exchangeService->executeExchange(
                user: $user,
                sourceWallet: $sourceWallet,
                destinationWallet: $destWallet,
                sellAmount: (string) $request->input('sell_amount'),
                quoteId: $request->input('quote_id')
            );

            return ApiResponse::success([
                'transaction' => new TransactionResource($result['transaction']),
                'source_balance' => $result['sell_balance'],
                'destination_balance' => $result['buy_balance'],
            ], 'Conversion de devises effectuée avec succès', 201);
        } catch (Exception $e) {
            $statusCode = in_array($e->getCode(), [400, 403, 404, 422]) ? $e->getCode() : 400;

            return ApiResponse::error(
                code: 'EXCHANGE_FAILED',
                message: $e->getMessage(),
                status: $statusCode
            );
        }
    }

    /**
     * GET /api/exchange-rates
     */
    public function rates(Request $request): JsonResponse
    {
        $rates = ExchangeRate::with(['baseCurrency', 'quoteCurrency'])->get();

        return ApiResponse::success(ExchangeRateResource::collection($rates));
    }
}
