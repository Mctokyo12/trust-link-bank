<?php

namespace App\Http\Requests;

class ExchangeExecuteRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'source_wallet_id' => ['required', 'exists:wallets,id'],
            'destination_wallet_id' => ['required', 'different:source_wallet_id', 'exists:wallets,id'],
            'sell_amount' => ['required', 'numeric', 'gt:0'],
            'quote_id' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
