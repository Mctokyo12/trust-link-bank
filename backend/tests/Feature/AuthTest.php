<?php

use App\Models\Country;
use App\Models\User;
use App\Models\Wallet;

test('guest can register account and automatically receives multi-currency wallets and token', function () {
    $country = Country::where('code', 'CM')->first();

    $response = $this->postJson('/api/auth/register', [
        'name' => 'Paul Biya',
        'email' => 'paul@example.com',
        'phone' => '+237699112233',
        'password' => 'NovaSecure2026!',
        'password_confirmation' => 'NovaSecure2026!',
        'country_code' => 'CM',
        'language' => 'fr',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'data' => [
                'user' => ['id', 'uuid', 'name', 'email', 'phone', 'novatag', 'country', 'role'],
                'token',
                'token_type',
            ]
        ]);

    $user = User::where('email', 'paul@example.com')->first();
    expect($user)->not->toBeNull();

    // Verify 3 multi-currency wallets provisioned
    $wallets = Wallet::where('user_id', $user->id)->get();
    expect($wallets)->toHaveCount(3);
});

test('user cannot register with duplicate email or phone', function () {
    $this->postJson('/api/auth/register', [
        'name' => 'Duplicate Test',
        'email' => 'amina@novapay.africa', // Already seeded
        'phone' => '+237670123456',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'country_code' => 'CM',
    ])->assertStatus(422)
      ->assertJsonPath('error.code', 'VALIDATION_FAILED');
});

test('user can login with valid credentials', function () {
    $response = $this->postJson('/api/auth/login', [
        'identifier' => 'amina@novapay.africa',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => ['user', 'token']
        ]);
});

test('user cannot login with invalid credentials', function () {
    $this->postJson('/api/auth/login', [
        'identifier' => 'amina@novapay.africa',
        'password' => 'wrong-password',
    ])->assertStatus(401)
      ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('simulated OTP verification succeeds with demo code 123456', function () {
    $response = $this->postJson('/api/auth/otp/verify', [
        'identifier' => '+237670123456',
        'code' => '123456',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.verified', true);
});

test('simulated OTP verification fails with non-numeric or short code', function () {
    $response = $this->postJson('/api/auth/otp/verify', [
        'identifier' => '+237670123456',
        'code' => 'abc',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_FAILED');
});
