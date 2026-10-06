<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KycProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
                'email' => $this->user?->email,
                'phone' => $this->user?->phone,
                'country' => $this->user?->country?->name,
            ],
            'status' => $this->status,
            'level' => $this->level,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'verified_at' => $this->verified_at?->toISOString(),
            'rejection_reason' => $this->rejection_reason,
            'documents' => $this->documents->map(fn($doc) => [
                'id' => $doc->id,
                'type' => $doc->type,
                'document_number' => $doc->document_number,
                'status' => $doc->status,
            ]),
        ];
    }
}
