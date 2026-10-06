<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Enforces Idempotency at DB level with unique constraint per specification
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->string('key', 128)->unique(); // DB-level unique constraint
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('path');
            $table->string('request_hash', 64);
            $table->unsignedSmallInteger('response_code')->nullable();
            $table->json('response_body')->nullable();
            $table->string('transaction_reference', 64)->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('device_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('device');
            $table->string('browser')->nullable();
            $table->string('platform')->nullable();
            $table->string('ip_hash', 64);
            $table->string('ip_address', 45)->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamp('last_seen')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'last_seen']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sessions');
        Schema::dropIfExists('idempotency_keys');
    }
};
