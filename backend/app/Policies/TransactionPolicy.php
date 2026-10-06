<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function view(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $userWalletIds = $user->wallets()->pluck('id')->toArray();
        return $transaction->entries()->whereIn('wallet_id', $userWalletIds)->exists();
    }
}
