<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'sender' => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'novatag' => $this->sender?->novatag,
            ],
            'receiver' => $this->receiver ? [
                'id' => $this->receiver->id,
                'name' => $this->receiver->name,
                'novatag' => $this->receiver->novatag,
            ] : null,
            'recipient_name' => $this->recipient_name,
            'recipient_identifier' => $this->recipient_identifier,
            'channel' => $this->channel,
            'provider' => $this->provider,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
