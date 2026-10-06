<?php

namespace App\Http\Requests;

class ExchangeQuoteRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'from_currency' => ['required', 'string', 'exists:currencies,code'],
            'to_currency' => ['required', 'string', 'different:from_currency', 'exists:currencies,code'],
            'from_amount' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
