<?php

namespace App\Services\Payment;

class SimulatedPaymentGatewayService
{
    /**
     * Simulate incoming Mobile Money or Bank deposit
     */
    public function simulateWebhook(string $provider, array $payload): array
    {
        return [
            'status' => 'success',
            'provider_reference' => 'EXT-' . strtoupper(bin2hex(random_bytes(6))),
            'provider' => $provider,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Check provider health / corridor availability
     */
    public function getCorridorHealth(): array
    {
        return [
            'momo_cameroon' => ['provider' => 'MTN', 'status' => 'operational', 'latency_ms' => 12],
            'momo_senegal' => ['provider' => 'Wave', 'status' => 'operational', 'latency_ms' => 15],
            'momo_cote_ivoire' => ['provider' => 'Orange', 'status' => 'operational', 'latency_ms' => 18],
            'sepa_instant' => ['provider' => 'SEPA_EUR', 'status' => 'operational', 'latency_ms' => 45],
            'us_ach' => ['provider' => 'FED_ACH', 'status' => 'operational', 'latency_ms' => 60],
        ];
    }
}
