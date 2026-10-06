<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreExchangeRateRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'base_currency_code' => ['required', 'string', 'exists:currencies,code'],
            'quote_currency_code' => ['required', 'string', 'different:base_currency_code', 'exists:currencies,code'],
            'rate' => ['required', 'numeric', 'gt:0'],
            'spread_percentage' => ['sometimes', 'numeric', 'gte:0'],
            'is_fixed' => ['sometimes', 'boolean'],
        ];
    }
}
