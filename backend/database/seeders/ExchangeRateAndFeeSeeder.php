<?php

namespace Database\Seeders;

use App\Models\Currency;
use App\Models\ExchangeRate;
use App\Models\Fee;
use Illuminate\Database\Seeder;

class ExchangeRateAndFeeSeeder extends Seeder
{
    public function run(): void
    {
        $xaf = Currency::where('code', 'XAF')->first();
        $usd = Currency::where('code', 'USD')->first();
        $eur = Currency::where('code', 'EUR')->first();

        if (!$xaf || !$usd || !$eur) {
            return;
        }

        // 1. Exchange Rates
        $rates = [
            // EUR/XAF: BEAC Fixed Parity
            [
                'base_currency_id' => $eur->id,
                'quote_currency_id' => $xaf->id,
                'rate' => '655.957000',
                'spread_percentage' => '0.0000',
                'is_fixed' => true,
            ],
            // USD/XAF
            [
                'base_currency_id' => $usd->id,
                'quote_currency_id' => $xaf->id,
                'rate' => '604.500000',
                'spread_percentage' => '0.0020',
                'is_fixed' => false,
            ],
            // EUR/USD
            [
                'base_currency_id' => $eur->id,
                'quote_currency_id' => $usd->id,
                'rate' => '1.085100',
                'spread_percentage' => '0.0015',
                'is_fixed' => false,
            ],
        ];

        foreach ($rates as $r) {
            ExchangeRate::updateOrCreate(
                ['base_currency_id' => $r['base_currency_id'], 'quote_currency_id' => $r['quote_currency_id']],
                $r
            );
        }

        // 2. Fee Schedules
        $feeConfigs = [
            ['type' => 'transfer_trustlink', 'currency_id' => $xaf->id, 'fixed_amount' => '0.0000', 'percentage' => '0.0000'],
            ['type' => 'transfer_novapay', 'currency_id' => $xaf->id, 'fixed_amount' => '0.0000', 'percentage' => '0.0000'],
            ['type' => 'transfer_momo', 'currency_id' => $xaf->id, 'fixed_amount' => '150.0000', 'percentage' => '0.5000', 'max_fee' => '2500.0000'],
            ['type' => 'transfer_bank', 'currency_id' => $xaf->id, 'fixed_amount' => '500.0000', 'percentage' => '0.2500', 'max_fee' => '5000.0000'],
            ['type' => 'transfer_bank', 'currency_id' => $eur->id, 'fixed_amount' => '0.8000', 'percentage' => '0.1000', 'max_fee' => '15.0000'],
            ['type' => 'transfer_bank', 'currency_id' => $usd->id, 'fixed_amount' => '1.5000', 'percentage' => '0.2000', 'max_fee' => '25.0000'],
        ];

        foreach ($feeConfigs as $f) {
            Fee::updateOrCreate(
                ['type' => $f['type'], 'currency_id' => $f['currency_id']],
                $f
            );
        }
    }
}
