<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class StoreFeeRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'type' => ['required', 'string'],
            'currency_code' => ['required', 'string', 'exists:currencies,code'],
            'fixed_amount' => ['required', 'numeric', 'gte:0'],
            'percentage' => ['required', 'numeric', 'gte:0', 'lte:100'],
            'min_fee' => ['sometimes', 'nullable', 'numeric', 'gte:0'],
            'max_fee' => ['sometimes', 'nullable', 'numeric', 'gte:0'],
        ];
    }
}
