<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // visiteur, client, support, administrateur, super_administrateur
            $table->string('display_name');
            $table->string('description')->nullable();
            $table->json('permissions')->nullable();
            $table->timestamps();
        });

        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique(); // CM, SN, CI, GA, etc.
            $table->string('name');
            $table->string('currency_code', 3); // XAF, XOF, etc.
            $table->string('phone_code', 10); // +237, +221, etc.
            $table->string('flag_emoji', 8)->default('🌍');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique(); // XAF, USD, EUR
            $table->string('name');
            $table->string('symbol', 10); // FCFA, $, €
            $table->unsignedTinyInteger('decimals')->default(0); // 0 for XAF, 2 for USD/EUR
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('countries');
        Schema::dropIfExists('roles');
    }
};
