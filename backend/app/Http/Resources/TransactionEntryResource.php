<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'wallet_id' => $this->wallet_id,
            'direction' => $this->direction,
            'amount' => $this->amount,
            'entry_type' => $this->entry_type,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
