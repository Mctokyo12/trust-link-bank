<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'type' => $this->type,
            'status' => $this->status,
            'amount' => $this->amount,
            'fee_amount' => $this->fee_amount,
            'currency' => $this->currency?->code,
            'description' => $this->description,
            'metadata' => $this->metadata,
            'transfer' => new TransferResource($this->whenLoaded('transfer')),
            'entries' => TransactionEntryResource::collection($this->whenLoaded('entries')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
