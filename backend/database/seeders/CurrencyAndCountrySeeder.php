<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencyAndCountrySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Currencies
        $currencies = [
            ['code' => 'XAF', 'name' => 'Franc CFA (BEAC)', 'symbol' => 'FCFA', 'decimals' => 0, 'status' => 'active'],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'decimals' => 2, 'status' => 'active'],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'decimals' => 2, 'status' => 'active'],
        ];

        foreach ($currencies as $cur) {
            Currency::updateOrCreate(['code' => $cur['code']], $cur);
        }

        // 2. Seed African Countries
        $countries = [
            ['code' => 'CM', 'name' => 'Cameroun', 'currency_code' => 'XAF', 'phone_code' => '+237', 'flag_emoji' => '🇨🇲'],
            ['code' => 'SN', 'name' => 'Sénégal', 'currency_code' => 'XOF', 'phone_code' => '+221', 'flag_emoji' => '🇸🇳'],
            ['code' => 'CI', 'name' => "Côte d'Ivoire", 'currency_code' => 'XOF', 'phone_code' => '+225', 'flag_emoji' => '🇨🇮'],
            ['code' => 'GA', 'name' => 'Gabon', 'currency_code' => 'XAF', 'phone_code' => '+241', 'flag_emoji' => '🇬🇦'],
            ['code' => 'CG', 'name' => 'Congo-Brazzaville', 'currency_code' => 'XAF', 'phone_code' => '+242', 'flag_emoji' => '🇨🇬'],
            ['code' => 'TD', 'name' => 'Tchad', 'currency_code' => 'XAF', 'phone_code' => '+235', 'flag_emoji' => '🇹🇩'],
            ['code' => 'NG', 'name' => 'Nigeria', 'currency_code' => 'NGN', 'phone_code' => '+234', 'flag_emoji' => '🇳🇬'],
        ];

        foreach ($countries as $country) {
            Country::updateOrCreate(['code' => $country['code']], $country);
        }
    }
}
