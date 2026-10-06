<?php

namespace App\Services\Transfer;

use App\Models\AuditLog;
use App\Models\Fee;
use App\Models\Notification;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Wallet\WalletLedgerService;
use Exception;

class TransferService
{
    public function __construct(
        protected WalletLedgerService $ledgerService
    ) {}

    /**
     * Calculate network fee based on channel and currency
     */
    public function calculateFee(string $type, int $currencyId, string $amount): string
    {
        $feeConfig = Fee::where('type', $type)
            ->where('currency_id', $currencyId)
            ->first();

        if (!$feeConfig) {
            return '0.0000';
        }

        $percentagePart = '0.0000';
        if (bccomp($feeConfig->percentage, '0.0000', 4) > 0) {
            $percentagePart = bcdiv(
                bcmul($amount, $feeConfig->percentage, 4),
                '100.0000',
                4
            );
        }

        $totalFee = bcadd($feeConfig->fixed_amount, $percentagePart, 4);

        if ($feeConfig->min_fee && bccomp($totalFee, $feeConfig->min_fee, 4) < 0) {
            $totalFee = $feeConfig->min_fee;
        }

        if ($feeConfig->max_fee && bccomp($totalFee, $feeConfig->max_fee, 4) > 0) {
            $totalFee = $feeConfig->max_fee;
        }

        return $totalFee;
    }

    /**
     * Send transfer from sender user to either internal user or simulated MoMo/Bank recipient
     */
    public function executeTransfer(
        User $sender,
        Wallet $sourceWallet,
        string $channel, // 'novapay', 'momo', 'bank'
        string $recipientIdentifier, // Phone, novatag, or IBAN
        string $amount,
        ?string $recipientName = null,
        ?string $provider = null, // MTN, Orange, Wave, SEPA
        ?string $reason = null
    ): array {
        if ($sourceWallet->user_id !== $sender->id) {
            throw new Exception("You do not own this source wallet.", 403);
        }

        $feeAmount = $this->calculateFee("transfer_{$channel}", $sourceWallet->currency_id, $amount);

        // Find destination wallet
        $receiverUser = null;
        $destinationWallet = null;

        if (in_array($channel, ['trustlink', 'novapay'])) {
            // Find user by novatag, phone, or email
            $cleanTag = ltrim($recipientIdentifier, '@');
            $receiverUser = User::where('novatag', '@' . $cleanTag)
                ->orWhere('phone', $recipientIdentifier)
                ->orWhere('email', $recipientIdentifier)
                ->first();

            if (!$receiverUser) {
                throw new Exception("Recipient user not found on Trust Link Bank.", 404);
            }

            if ($receiverUser->id === $sender->id) {
                throw new Exception("Cannot send money to your own wallet as a P2P transfer.", 422);
            }

            $destinationWallet = Wallet::where('user_id', $receiverUser->id)
                ->where('currency_id', $sourceWallet->currency_id)
                ->first();

            if (!$destinationWallet) {
                throw new Exception("Recipient does not have an active {$sourceWallet->currency->code} wallet.", 422);
            }

            $recipientName = $recipientName ?? $receiverUser->name;
        } else {
            // For external MoMo or Bank payout:
            // In double-entry system, simulated outbound settlement transits through segregated clearing pool
            $destinationWallet = Wallet::where('account_number', 'NP_CLEARING_' . $sourceWallet->currency->code)->first();

            if (!$destinationWallet) {
                // Fallback to source wallet or system pool
                $destinationWallet = Wallet::where('currency_id', $sourceWallet->currency_id)
                    ->where('id', '!=', $sourceWallet->id)
                    ->first() ?? $sourceWallet;
            }
        }

        $transaction = $this->ledgerService->recordTransfer(
            sourceWallet: $sourceWallet,
            destinationWallet: $destinationWallet,
            amount: $amount,
            feeAmount: $feeAmount,
            type: "transfer_{$channel}",
            description: $reason ?? "Transfer to {$recipientName} ({$recipientIdentifier})",
            metadata: [
                'channel' => $channel,
                'provider' => $provider,
                'recipient_name' => $recipientName,
                'recipient_identifier' => $recipientIdentifier,
                'reason' => $reason,
                'sender_name' => $sender->name,
                'currency' => $sourceWallet->currency->code,
            ]
        );

        // Record Transfer row
        $transfer = Transfer::create([
            'transaction_id' => $transaction->id,
            'sender_id' => $sender->id,
            'receiver_id' => $receiverUser?->id,
            'recipient_name' => $recipientName ?? 'Recipient',
            'recipient_identifier' => $recipientIdentifier,
            'channel' => $channel,
            'provider' => $provider,
        ]);

        // Create Notifications
        Notification::create([
            'user_id' => $sender->id,
            'type' => 'transaction',
            'title' => 'Transfert envoyé',
            'body' => "Votre transfert de {$amount} {$sourceWallet->currency->code} à {$recipientName} a été exécuté avec succès.",
            'data' => ['transaction_id' => $transaction->id, 'reference' => $transaction->reference],
        ]);

        if ($receiverUser) {
            Notification::create([
                'user_id' => $receiverUser->id,
                'type' => 'transaction',
                'title' => 'Virement reçu',
                'body' => "Vous avez reçu {$amount} {$sourceWallet->currency->code} de la part de {$sender->name}.",
                'data' => ['transaction_id' => $transaction->id, 'reference' => $transaction->reference],
            ]);
        }

        // Audit log
        AuditLog::create([
            'actor_id' => $sender->id,
            'actor_name' => $sender->name,
            'action' => 'TRANSFER_COMPLETED',
            'entity' => 'Transaction',
            'entity_id' => (string) $transaction->id,
            'metadata' => [
                'reference' => $transaction->reference,
                'amount' => $amount,
                'currency' => $sourceWallet->currency->code,
                'channel' => $channel,
            ],
            'created_at' => now(),
        ]);

        return [
            'transaction' => $transaction,
            'transfer' => $transfer,
            'new_balance' => $this->ledgerService->deriveBalance($sourceWallet)['available'],
        ];
    }
}
