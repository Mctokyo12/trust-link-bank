<?php

use App\Models\AuditLog;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->admin = User::where('email', 'admin@novapay.africa')->first();
    $this->client = User::where('email', 'amina@novapay.africa')->first();
});

test('regular client is rejected when attempting to access admin endpoints with 403', function () {
    Sanctum::actingAs($this->client);

    $this->getJson('/api/admin/users')
        ->assertStatus(403)
        ->assertJsonPath('error.code', 'FORBIDDEN');
});

test('administrator can list registered users with pagination', function () {
    Sanctum::actingAs($this->admin);

    $response = $this->getJson('/api/admin/users');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'items' => [
                    '*' => ['id', 'name', 'email', 'phone', 'role', 'status']
                ],
                'pagination'
            ]
        ]);
});

test('administrator can suspend a user and automatic audit log is created', function () {
    Sanctum::actingAs($this->admin);

    $target = User::factory()->create(['status' => 'active']);

    $response = $this->patchJson("/api/admin/users/{$target->id}", [
        'status' => 'suspended',
        'reason' => 'Suspicion de fraude Mobile Money',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'suspended');

    // Verify Audit Log entry created
    $log = AuditLog::where('actor_id', $this->admin->id)
        ->where('action', 'USER_STATUS_UPDATED')
        ->where('entity_id', (string) $target->id)
        ->first();

    expect($log)->not->toBeNull();
    expect($log->metadata['new_status'])->toBe('suspended');
});
