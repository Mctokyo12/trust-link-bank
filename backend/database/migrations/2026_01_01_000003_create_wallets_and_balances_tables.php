<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('currency_id')->constrained('currencies')->cascadeOnUpdate();
            $table->string('account_number')->unique();
            $table->string('iban')->nullable();
            $table->string('bic_swift')->nullable();
            $table->enum('status', ['active', 'frozen', 'closed'])->default('active');
            $table->timestamps();

            $table->unique(['user_id', 'currency_id']);
        });

        Schema::create('wallet_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->unique()->constrained('wallets')->cascadeOnDelete();
            // Note: DECIMAL(18, 4) used for all monetary amounts per specification.
            // Derived/maintained values, NEVER the source of truth on their own.
            $table->decimal('available', 18, 4)->default(0.0000);
            $table->decimal('pending', 18, 4)->default(0.0000);
            $table->timestamp('last_reconciled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_balances');
        Schema::dropIfExists('wallets');
    }
};
