<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'novatag' => $this->novatag,
            'country' => [
                'code' => $this->country?->code,
                'name' => $this->country?->name,
                'currency_code' => $this->country?->currency_code,
                'flag' => $this->country?->flag_emoji,
            ],
            'role' => $this->role?->name,
            'language' => $this->language,
            'status' => $this->status,
            'avatar_url' => $this->avatar_url,
            'kyc_level' => $this->kycProfile?->level ?? 1,
            'kyc_status' => $this->kycProfile?->status ?? 'unverified',
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
