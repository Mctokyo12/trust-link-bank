<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Currency;
use App\Models\KycProfile;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\TransactionEntry;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletBalance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RoleAndUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $roles = [
            [
                'name' => 'visiteur',
                'display_name' => 'Visiteur',
                'description' => 'Utilisateur non authentifié',
                'permissions' => ['rates:view'],
            ],
            [
                'name' => 'client',
                'display_name' => 'Client Particulier / Business',
                'description' => 'Titulaire de compte avec accès portefeuilles et virements',
                'permissions' => ['wallet:view', 'transfer:create', 'exchange:create', 'beneficiaries:manage'],
            ],
            [
                'name' => 'support',
                'display_name' => 'Agent Support Client',
                'description' => 'Gestion des tickets et vérification KYC niveau 1',
                'permissions' => ['users:view', 'kyc:view', 'transactions:view'],
            ],
            [
                'name' => 'administrateur',
                'display_name' => 'Administrateur Financier',
                'description' => 'Gestion des taux de change, frais et validation KYC',
                'permissions' => ['users:manage', 'rates:manage', 'fees:manage', 'kyc:manage', 'transactions:view'],
            ],
            [
                'name' => 'super_administrateur',
                'display_name' => 'Super Administrateur',
                'description' => 'Accès total à la plateforme et journaux d’audit',
                'permissions' => ['*'],
            ],
        ];

        foreach ($roles as $r) {
            Role::updateOrCreate(['name' => $r['name']], $r);
        }

        $superAdminRole = Role::where('name', 'super_administrateur')->first();
        $clientRole = Role::where('name', 'client')->first();
        $cameroon = Country::where('code', 'CM')->first();
        $currencies = Currency::all()->keyBy('code');

        // 2. Super Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@novapay.africa'],
            [
                'name' => 'Chef Administrateur Trust Link Bank',
                'phone' => '+237670000001',
                'novatag' => '@admin',
                'password' => Hash::make('NovaPay2026!Admin'),
                'country_id' => $cameroon->id,
                'role_id' => $superAdminRole->id,
                'language' => 'fr',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // 3. Demo Client User: Amina Sow
        $amina = User::updateOrCreate(
            ['email' => 'amina@novapay.africa'],
            [
                'name' => 'Amina Sow',
                'phone' => '+237670123456',
                'novatag' => '@amina_xaf',
                'password' => Hash::make('password123'),
                'country_id' => $cameroon->id,
                'role_id' => $clientRole->id,
                'language' => 'fr',
                'status' => 'active',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        KycProfile::updateOrCreate(
            ['user_id' => $amina->id],
            [
                'status' => 'verified',
                'level' => 2,
                'submitted_at' => now()->subDays(10),
                'verified_at' => now()->subDays(9),
            ]
        );

        // Provision Amina's Wallets and initial Double-Entry Ledger balances
        $initialFunds = [
            'XAF' => ['amount' => '2450000.0000', 'acc' => 'NP237-XAF-889102'],
            'USD' => ['amount' => '3250.0000', 'acc' => 'NPUSA-USD-192837'],
            'EUR' => ['amount' => '1840.0000', 'acc' => 'NPEUR-EUR-554433'],
        ];

        foreach ($initialFunds as $currCode => $fund) {
            $currency = $currencies[$currCode];
            $wallet = Wallet::updateOrCreate(
                ['user_id' => $amina->id, 'currency_id' => $currency->id],
                [
                    'account_number' => $fund['acc'],
                    'iban' => $currCode === 'EUR' ? 'FR7630006000011234567890189' : null,
                    'bic_swift' => $currCode === 'EUR' ? 'NOVAFRPPXXX' : null,
                    'status' => 'active',
                ]
            );

            // Double-entry initial funding transaction
            $exists = TransactionEntry::where('wallet_id', $wallet->id)->exists();
            if (!$exists) {
                $tx = Transaction::create([
                    'reference' => 'NP-DEP-INIT-' . $currCode,
                    'type' => 'deposit',
                    'status' => 'completed',
                    'amount' => $fund['amount'],
                    'fee_amount' => '0.0000',
                    'currency_id' => $currency->id,
                    'description' => "Initial deposit - {$currCode} Liquidity Pool",
                ]);

                // Double-entry credit to user's wallet
                TransactionEntry::create([
                    'transaction_id' => $tx->id,
                    'wallet_id' => $wallet->id,
                    'direction' => 'credit',
                    'amount' => $fund['amount'],
                    'entry_type' => 'principal',
                    'created_at' => now()->subDays(5),
                ]);

                // Update projection
                WalletBalance::updateOrCreate(
                    ['wallet_id' => $wallet->id],
                    [
                        'available' => $fund['amount'],
                        'pending' => '0.0000',
                        'last_reconciled_at' => now(),
                    ]
                );
            }
        }
    }
}
