<?php

namespace App\Http\Requests;

class TransferRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'source_wallet_id' => ['required', 'exists:wallets,id'],
            'channel' => ['required', 'string', 'in:trustlink,novapay,momo,bank'],
            'recipient_identifier' => ['required', 'string'],
            'recipient_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'provider' => ['sometimes', 'nullable', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
