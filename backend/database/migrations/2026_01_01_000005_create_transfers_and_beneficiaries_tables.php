<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recipient_name')->nullable();
            $table->string('recipient_identifier')->nullable(); // Phone, Novatag, IBAN
            $table->string('channel', 32)->default('novapay'); // novapay, momo, bank
            $table->string('provider', 32)->nullable(); // MTN, Orange, Wave, SEPA
            $table->timestamps();

            $table->index(['sender_id', 'created_at']);
            $table->index(['receiver_id', 'created_at']);
        });

        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('beneficiary_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('alias');
            $table->string('full_name');
            $table->string('channel', 32)->default('novapay'); // novapay, momo, bank
            $table->string('provider', 32)->nullable(); // MTN, Orange, Wave, Ecobank, etc.
            $table->string('identifier'); // Phone, IBAN, or Novatag
            $table->foreignId('currency_id')->constrained('currencies')->cascadeOnUpdate();
            $table->boolean('is_favorite')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
        Schema::dropIfExists('transfers');
    }
};
