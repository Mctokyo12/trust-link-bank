<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BeneficiaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'alias' => $this->alias,
            'full_name' => $this->full_name,
            'channel' => $this->channel,
            'provider' => $this->provider,
            'identifier' => $this->identifier,
            'currency' => $this->currency?->code,
            'is_favorite' => $this->is_favorite,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
