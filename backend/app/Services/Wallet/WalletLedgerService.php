<?php

namespace App\Services\Wallet;

use App\Models\Transaction;
use App\Models\TransactionEntry;
use App\Models\Wallet;
use App\Models\WalletBalance;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletLedgerService
{
    /**
     * Precision scale for BCMath monetary calculations (DECIMAL(18, 4))
     */
    public const SCALE = 4;

    /**
     * Derive exact available balance directly from double-entry transaction_entries (Source of Truth)
     */
    public function deriveBalance(Wallet $wallet): array
    {
        $creditsRaw = TransactionEntry::where('wallet_id', $wallet->id)
            ->where('direction', 'credit')
            ->sum('amount');

        $debitsRaw = TransactionEntry::where('wallet_id', $wallet->id)
            ->where('direction', 'debit')
            ->sum('amount');

        $credits = bcadd((string) ($creditsRaw ?? '0'), '0', self::SCALE);
        $debits = bcadd((string) ($debitsRaw ?? '0'), '0', self::SCALE);

        $available = bcsub($credits, $debits, self::SCALE);

        // Prevent negative representations due to potential float artifacts
        if (bccomp($available, '0.0000', self::SCALE) < 0) {
            $available = '0.0000';
        }

        return [
            'available' => $available,
            'total_credited' => $credits,
            'total_debited' => $debits,
        ];
    }

    /**
     * Get or synchronize the controlled wallet_balances projection row
     */
    public function getBalance(Wallet $wallet, bool $forceRecalculate = false): array
    {
        $projection = $wallet->balanceProjection;

        if (!$projection || $forceRecalculate) {
            $derived = $this->deriveBalance($wallet);

            $projection = WalletBalance::updateOrCreate(
                ['wallet_id' => $wallet->id],
                [
                    'available' => $derived['available'],
                    'pending' => '0.0000',
                    'last_reconciled_at' => now(),
                ]
            );

            return [
                'available' => $projection->available,
                'pending' => $projection->pending,
            ];
        }

        return [
            'available' => $projection->available,
            'pending' => $projection->pending,
        ];
    }

    /**
     * Check if wallet has sufficient available balance
     */
    public function hasSufficientBalance(Wallet $wallet, string $requiredAmount): bool
    {
        $balance = $this->deriveBalance($wallet);
        return bccomp($balance['available'], $requiredAmount, self::SCALE) >= 0;
    }

    /**
     * Execute a transfer with atomic double-entry debit and credit entries.
     * Enforces row-level locks on wallet records in sorted order to prevent race conditions and deadlocks.
     */
    public function recordTransfer(
        Wallet $sourceWallet,
        Wallet $destinationWallet,
        string $amount,
        string $feeAmount = '0.0000',
        string $type = 'transfer_p2p',
        ?string $description = null,
        ?array $metadata = null,
        ?string $customReference = null
    ): Transaction {
        // Enforce monetary validation
        if (bccomp($amount, '0.0000', self::SCALE) <= 0) {
            throw new Exception("Transfer amount must be strictly positive.", 422);
        }

        $totalDebitRequired = bcadd($amount, $feeAmount, self::SCALE);
        $reference = $customReference ?? ('NP-TRF-' . strtoupper(Str::random(10)));

        return DB::transaction(function () use (
            $sourceWallet,
            $destinationWallet,
            $amount,
            $feeAmount,
            $totalDebitRequired,
            $type,
            $description,
            $metadata,
            $reference
        ) {
            // Deadlock prevention: Always lock rows in ascending ID order
            $firstId = min($sourceWallet->id, $destinationWallet->id);
            $secondId = max($sourceWallet->id, $destinationWallet->id);

            $lockedWallets = Wallet::whereIn('id', [$firstId, $secondId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lockedSource = $lockedWallets->get($sourceWallet->id);
            $lockedDest = $lockedWallets->get($destinationWallet->id);

            if (!$lockedSource || $lockedSource->status !== 'active') {
                throw new Exception("Source wallet is unavailable or inactive.", 403);
            }

            if (!$lockedDest || $lockedDest->status !== 'active') {
                throw new Exception("Destination wallet is unavailable or inactive.", 403);
            }

            // Verify available balance under row lock from ledger entries
            $sourceDerived = $this->deriveBalance($lockedSource);
            if (bccomp($sourceDerived['available'], $totalDebitRequired, self::SCALE) < 0) {
                throw new Exception("Insufficient available balance. Required: {$totalDebitRequired}, Available: {$sourceDerived['available']}", 422);
            }

            // 1. Create Transaction record
            $transaction = Transaction::create([
                'reference' => $reference,
                'type' => $type,
                'status' => 'completed',
                'amount' => $amount,
                'fee_amount' => $feeAmount,
                'currency_id' => $lockedSource->currency_id,
                'description' => $description ?? "Transfer from {$lockedSource->account_number} to {$lockedDest->account_number}",
                'metadata' => array_merge($metadata ?? [], [
                    'source_wallet_id' => $lockedSource->id,
                    'destination_wallet_id' => $lockedDest->id,
                ]),
            ]);

            // 2. Double-Entry: DEBIT source wallet for principal amount
            TransactionEntry::create([
                'transaction_id' => $transaction->id,
                'wallet_id' => $lockedSource->id,
                'direction' => 'debit',
                'amount' => $amount,
                'entry_type' => 'principal',
                'created_at' => now(),
            ]);

            // 3. Double-Entry: DEBIT source wallet for fee if applicable
            if (bccomp($feeAmount, '0.0000', self::SCALE) > 0) {
                TransactionEntry::create([
                    'transaction_id' => $transaction->id,
                    'wallet_id' => $lockedSource->id,
                    'direction' => 'debit',
                    'amount' => $feeAmount,
                    'entry_type' => 'fee',
                    'created_at' => now(),
                ]);
            }

            // 4. Double-Entry: CREDIT destination wallet for principal amount
            TransactionEntry::create([
                'transaction_id' => $transaction->id,
                'wallet_id' => $lockedDest->id,
                'direction' => 'credit',
                'amount' => $amount,
                'entry_type' => 'principal',
                'created_at' => now(),
            ]);

            // 5. Update controlled projection balances inside the exact same DB transaction
            $newSourceBalance = bcsub($sourceDerived['available'], $totalDebitRequired, self::SCALE);
            WalletBalance::updateOrCreate(
                ['wallet_id' => $lockedSource->id],
                ['available' => $newSourceBalance, 'last_reconciled_at' => now()]
            );

            $destDerived = $this->deriveBalance($lockedDest);
            WalletBalance::updateOrCreate(
                ['wallet_id' => $lockedDest->id],
                ['available' => $destDerived['available'], 'last_reconciled_at' => now()]
            );

            return $transaction;
        });
    }

    /**
     * Execute atomic currency exchange across multi-currency wallets using double-entry ledger.
     */
    public function recordExchange(
        Wallet $sellWallet,
        Wallet $buyWallet,
        string $sellAmount,
        string $buyAmount,
        string $rate,
        string $feeAmount = '0.0000',
        ?array $metadata = null,
        ?string $customReference = null
    ): Transaction {
        if (bccomp($sellAmount, '0.0000', self::SCALE) <= 0 || bccomp($buyAmount, '0.0000', self::SCALE) <= 0) {
            throw new Exception("Exchange amounts must be positive numbers.", 422);
        }

        $totalDebitRequired = bcadd($sellAmount, $feeAmount, self::SCALE);
        $reference = $customReference ?? ('NP-SWAP-' . strtoupper(Str::random(10)));

        return DB::transaction(function () use (
            $sellWallet,
            $buyWallet,
            $sellAmount,
            $buyAmount,
            $rate,
            $feeAmount,
            $totalDebitRequired,
            $metadata,
            $reference
        ) {
            // Lock wallets in fixed ID order
            $firstId = min($sellWallet->id, $buyWallet->id);
            $secondId = max($sellWallet->id, $buyWallet->id);

            $lockedWallets = Wallet::whereIn('id', [$firstId, $secondId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lockedSell = $lockedWallets->get($sellWallet->id);
            $lockedBuy = $lockedWallets->get($buyWallet->id);

            if (!$lockedSell || $lockedSell->status !== 'active') {
                throw new Exception("Source currency wallet is inactive.", 403);
            }
            if (!$lockedBuy || $lockedBuy->status !== 'active') {
                throw new Exception("Destination currency wallet is inactive.", 403);
            }

            // Check available balance
            $sellDerived = $this->deriveBalance($lockedSell);
            if (bccomp($sellDerived['available'], $totalDebitRequired, self::SCALE) < 0) {
                throw new Exception("Insufficient balance to execute currency swap.", 422);
            }

            // Create Transaction
            $transaction = Transaction::create([
                'reference' => $reference,
                'type' => 'exchange',
                'status' => 'completed',
                'amount' => $sellAmount,
                'fee_amount' => $feeAmount,
                'currency_id' => $lockedSell->currency_id,
                'description' => "Swap {$sellAmount} {$lockedSell->currency->code} -> {$buyAmount} {$lockedBuy->currency->code}",
                'metadata' => array_merge($metadata ?? [], [
                    'sell_wallet_id' => $lockedSell->id,
                    'buy_wallet_id' => $lockedBuy->id,
                    'sell_amount' => $sellAmount,
                    'sell_currency' => $lockedSell->currency->code,
                    'buy_amount' => $buyAmount,
                    'buy_currency' => $lockedBuy->currency->code,
                    'exchange_rate' => $rate,
                ]),
            ]);

            // Double-entry debit on sell wallet
            TransactionEntry::create([
                'transaction_id' => $transaction->id,
                'wallet_id' => $lockedSell->id,
                'direction' => 'debit',
                'amount' => $sellAmount,
                'entry_type' => 'principal',
                'created_at' => now(),
            ]);

            // Debit fee if present
            if (bccomp($feeAmount, '0.0000', self::SCALE) > 0) {
                TransactionEntry::create([
                    'transaction_id' => $transaction->id,
                    'wallet_id' => $lockedSell->id,
                    'direction' => 'debit',
                    'amount' => $feeAmount,
                    'entry_type' => 'fee',
                    'created_at' => now(),
                ]);
            }

            // Double-entry credit on buy wallet
            TransactionEntry::create([
                'transaction_id' => $transaction->id,
                'wallet_id' => $lockedBuy->id,
                'direction' => 'credit',
                'amount' => $buyAmount,
                'entry_type' => 'principal',
                'created_at' => now(),
            ]);

            // Sync projections
            $newSellBalance = bcsub($sellDerived['available'], $totalDebitRequired, self::SCALE);
            WalletBalance::updateOrCreate(
                ['wallet_id' => $lockedSell->id],
                ['available' => $newSellBalance, 'last_reconciled_at' => now()]
            );

            $buyDerived = $this->deriveBalance($lockedBuy);
            WalletBalance::updateOrCreate(
                ['wallet_id' => $lockedBuy->id],
                ['available' => $buyDerived['available'], 'last_reconciled_at' => now()]
            );

            return $transaction;
        });
    }
}
