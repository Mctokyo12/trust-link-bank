<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 64)->unique(); // Indexed for fast lookups e.g. NP-TRF-XXXXX
            $table->string('type', 32)->index();
            $table->enum('status', [
                'pending',
                'processing',
                'completed',
                'failed',
                'cancelled'
            ])->default('completed');
            $table->decimal('amount', 18, 4); // Always DECIMAL
            $table->decimal('fee_amount', 18, 4)->default(0.0000);
            $table->foreignId('currency_id')->constrained('currencies')->cascadeOnUpdate();
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index('created_at');
        });

        // Double-entry ledger source of truth
        Schema::create('transaction_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->enum('direction', ['debit', 'credit']);
            $table->decimal('amount', 18, 4);
            $table->string('entry_type', 32)->default('principal'); // principal, fee, exchange_spread
            $table->timestamp('created_at')->useCurrent();

            $table->index(['wallet_id', 'created_at']);
            $table->index(['transaction_id', 'wallet_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_entries');
        Schema::dropIfExists('transactions');
    }
};
