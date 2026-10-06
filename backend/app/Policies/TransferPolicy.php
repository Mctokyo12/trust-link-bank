<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;

class TransferPolicy
{
    public function view(User $user, Transfer $transfer): bool
    {
        return $transfer->sender_id === $user->id || $transfer->receiver_id === $user->id || $user->isAdmin();
    }
}
