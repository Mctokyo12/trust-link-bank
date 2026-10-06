<?php

namespace App\Http\Resources;

use App\Services\Wallet\WalletLedgerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var WalletLedgerService $ledgerService */
        $ledgerService = app(WalletLedgerService::class);
        $balances = $ledgerService->getBalance($this->resource);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'account_number' => $this->account_number,
            'iban' => $this->iban,
            'bic_swift' => $this->bic_swift,
            'status' => $this->status,
            'currency' => [
                'code' => $this->currency->code,
                'name' => $this->currency->name,
                'symbol' => $this->currency->symbol,
                'decimals' => $this->currency->decimals,
            ],
            'balance' => $balances['available'],
            'available_balance' => $balances['available'],
            'pending_balance' => $balances['pending'],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
