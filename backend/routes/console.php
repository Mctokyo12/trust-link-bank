<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('trustlinkbank:reconcile-all', function () {
    $this->info('Starting Trust Link Bank multi-wallet double-entry reconciliation...');
    $wallets = \App\Models\Wallet::all();
    $service = app(\App\Services\Wallet\WalletLedgerService::class);

    foreach ($wallets as $wallet) {
        $service->getBalance($wallet, true);
    }

    $this->info("Successfully reconciled {$wallets->count()} wallets against transaction_entries ledger.");
})->purpose('Reconcile all wallet balance projections against the immutable double-entry ledger');

Artisan::command('novapay:reconcile-all', function () {
    $this->call('trustlinkbank:reconcile-all');
})->purpose('Alias for trustlinkbank:reconcile-all');
