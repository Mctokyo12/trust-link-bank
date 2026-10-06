<?php

namespace Database\Factories;

use App\Models\Country;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        $role = Role::where('name', 'client')->first() ?? Role::first();
        $country = Country::where('iso_code', 'CM')->first() ?? Country::first();

        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+237' . fake()->numberBetween(650000000, 699999999),
            'novatag' => '@' . strtolower(Str::random(8)),
            'password' => Hash::make('password123'),
            'country_id' => $country ? $country->id : 1,
            'role_id' => $role ? $role->id : 1,
            'language' => 'fr',
            'status' => 'active',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ];
    }
}
