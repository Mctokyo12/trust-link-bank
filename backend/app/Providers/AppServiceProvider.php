<?php

namespace App\Providers;

use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\Wallet;
use App\Policies\TransactionPolicy;
use App\Policies\TransferPolicy;
use App\Policies\WalletPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Wallet::class, WalletPolicy::class);
        Gate::policy(Transfer::class, TransferPolicy::class);
        Gate::policy(Transaction::class, TransactionPolicy::class);
    }
}
