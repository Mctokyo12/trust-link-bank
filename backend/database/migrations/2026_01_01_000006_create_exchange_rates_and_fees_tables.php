<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('base_currency_id')->constrained('currencies')->cascadeOnDelete();
            $table->foreignId('quote_currency_id')->constrained('currencies')->cascadeOnDelete();
            // DECIMAL(18, 6) for financial FX precision
            $table->decimal('rate', 18, 6);
            $table->decimal('spread_percentage', 8, 4)->default(0.0020); // 0.20% default spread
            $table->boolean('is_fixed')->default(false); // true for EUR/XAF 655.957 fixed BEAC parity
            $table->timestamp('effective_at')->useCurrent();
            $table->timestamps();

            $table->unique(['base_currency_id', 'quote_currency_id']);
        });

        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            $table->string('type', 64); // transfer_p2p, transfer_momo, transfer_bank, exchange, withdrawal
            $table->foreignId('currency_id')->constrained('currencies')->cascadeOnDelete();
            $table->decimal('fixed_amount', 18, 4)->default(0.0000);
            $table->decimal('percentage', 8, 4)->default(0.0000); // e.g. 1.0000 = 1%
            $table->decimal('min_fee', 18, 4)->nullable();
            $table->decimal('max_fee', 18, 4)->nullable();
            $table->timestamps();

            $table->unique(['type', 'currency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fees');
        Schema::dropIfExists('exchange_rates');
    }
};
