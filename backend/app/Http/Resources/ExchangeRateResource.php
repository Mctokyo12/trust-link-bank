<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExchangeRateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'base_currency' => $this->baseCurrency?->code,
            'quote_currency' => $this->quoteCurrency?->code,
            'pair' => "{$this->baseCurrency?->code}/{$this->quoteCurrency?->code}",
            'rate' => $this->rate,
            'spread_percentage' => $this->spread_percentage,
            'is_fixed' => $this->is_fixed,
            'effective_at' => $this->effective_at?->toISOString(),
        ];
    }
}
