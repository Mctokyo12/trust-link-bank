<?php

namespace App\Services\Exchange;

use App\Models\AuditLog;
use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Models\Notification;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Wallet\WalletLedgerService;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ExchangeService
{
    public function __construct(
        protected WalletLedgerService $ledgerService
    ) {}

    /**
     * Get or derive exchange rate between two currencies
     */
    public function getRate(Currency $baseCurrency, Currency $quoteCurrency): array
    {
        if ($baseCurrency->id === $quoteCurrency->id) {
            return [
                'rate' => '1.000000',
                'is_fixed' => true,
                'spread' => '0.0000',
            ];
        }

        // Direct pair
        $direct = ExchangeRate::where('base_currency_id', $baseCurrency->id)
            ->where('quote_currency_id', $quoteCurrency->id)
            ->first();

        if ($direct) {
            return [
                'rate' => $direct->rate,
                'is_fixed' => $direct->is_fixed,
                'spread' => $direct->spread_percentage,
            ];
        }

        // Inverted pair
        $inverse = ExchangeRate::where('base_currency_id', $quoteCurrency->id)
            ->where('quote_currency_id', $baseCurrency->id)
            ->first();

        if ($inverse && bccomp($inverse->rate, '0.000000', 6) > 0) {
            $invertedRate = bcdiv('1.000000', $inverse->rate, 6);
            return [
                'rate' => $invertedRate,
                'is_fixed' => $inverse->is_fixed,
                'spread' => $inverse->spread_percentage,
            ];
        }

        // Fallbacks for simulated demo pairs
        $pair = "{$baseCurrency->code}_{$quoteCurrency->code}";
        $defaultRates = [
            'USD_XAF' => '604.500000',
            'XAF_USD' => '0.001654',
            'EUR_XAF' => '655.957000',
            'XAF_EUR' => '0.001524',
            'USD_EUR' => '0.921500',
            'EUR_USD' => '1.085100',
        ];

        $rate = $defaultRates[$pair] ?? '1.000000';
        $isFixed = in_array($pair, ['EUR_XAF', 'XAF_EUR']);

        return [
            'rate' => $rate,
            'is_fixed' => $isFixed,
            'spread' => '0.0020',
        ];
    }

    /**
     * Generate a guaranteed quote with 60s TTL
     */
    public function generateQuote(
        string $fromCurrencyCode,
        string $toCurrencyCode,
        string $fromAmount
    ): array {
        $fromCurrency = Currency::where('code', $fromCurrencyCode)->firstOrFail();
        $toCurrency = Currency::where('code', $toCurrencyCode)->firstOrFail();

        $rateInfo = $this->getRate($fromCurrency, $toCurrency);
        $rate = $rateInfo['rate'];

        // Calculate toAmount = fromAmount * rate
        $rawToAmount = bcmul($fromAmount, $rate, 4);

        // Apply spread (fee)
        $feeAmount = '0.0000'; // Zero conversion fee for promo or minor spread

        $quoteId = 'quote_' . Str::random(16);
        $expiresAt = now()->addSeconds(60);

        $quoteData = [
            'quote_id' => $quoteId,
            'from_currency' => $fromCurrencyCode,
            'to_currency' => $toCurrencyCode,
            'from_amount' => $fromAmount,
            'to_amount' => $rawToAmount,
            'rate' => $rate,
            'fee_amount' => $feeAmount,
            'is_fixed' => $rateInfo['is_fixed'],
            'expires_at' => $expiresAt->toISOString(),
            'expires_in_seconds' => 60,
        ];

        Cache::put("fx_quote:{$quoteId}", $quoteData, $expiresAt);

        return $quoteData;
    }

    /**
     * Execute conversion based on a quote or direct conversion
     */
    public function executeExchange(
        User $user,
        Wallet $sourceWallet,
        Wallet $destinationWallet,
        string $sellAmount,
        ?string $quoteId = null
    ): array {
        if ($sourceWallet->user_id !== $user->id || $destinationWallet->user_id !== $user->id) {
            throw new Exception("You must own both the source and destination wallets to execute a swap.", 403);
        }

        if ($sourceWallet->currency_id === $destinationWallet->currency_id) {
            throw new Exception("Source and destination currencies must be distinct.", 422);
        }

        $rate = null;
        $buyAmount = null;

        if ($quoteId && Cache::has("fx_quote:{$quoteId}")) {
            $quote = Cache::get("fx_quote:{$quoteId}");
            $rate = $quote['rate'];
            $buyAmount = $quote['to_amount'];
            Cache::forget("fx_quote:{$quoteId}");
        } else {
            $rateInfo = $this->getRate($sourceWallet->currency, $destinationWallet->currency);
            $rate = $rateInfo['rate'];
            $buyAmount = bcmul($sellAmount, $rate, 4);
        }

        $transaction = $this->ledgerService->recordExchange(
            sellWallet: $sourceWallet,
            buyWallet: $destinationWallet,
            sellAmount: $sellAmount,
            buyAmount: $buyAmount,
            rate: $rate,
            feeAmount: '0.0000',
            metadata: [
                'user_id' => $user->id,
                'pair' => "{$sourceWallet->currency->code}/{$destinationWallet->currency->code}",
            ]
        );

        Notification::create([
            'user_id' => $user->id,
            'type' => 'transaction',
            'title' => 'Conversion réussie',
            'body' => "Vous avez converti {$sellAmount} {$sourceWallet->currency->code} en {$buyAmount} {$destinationWallet->currency->code} au taux de {$rate}.",
            'data' => ['transaction_id' => $transaction->id, 'reference' => $transaction->reference],
        ]);

        AuditLog::create([
            'actor_id' => $user->id,
            'actor_name' => $user->name,
            'action' => 'EXCHANGE_SWAP_EXECUTED',
            'entity' => 'Transaction',
            'entity_id' => (string) $transaction->id,
            'metadata' => [
                'reference' => $transaction->reference,
                'pair' => "{$sourceWallet->currency->code}/{$destinationWallet->currency->code}",
                'rate' => $rate,
                'sell_amount' => $sellAmount,
                'buy_amount' => $buyAmount,
            ],
            'created_at' => now(),
        ]);

        return [
            'transaction' => $transaction,
            'sell_balance' => $this->ledgerService->deriveBalance($sourceWallet)['available'],
            'buy_balance' => $this->ledgerService->deriveBalance($destinationWallet)['available'],
        ];
    }
}
