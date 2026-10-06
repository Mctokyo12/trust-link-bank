<?php

namespace App\Http\Requests;

class StoreBeneficiaryRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'alias' => ['required', 'string', 'max:100'],
            'full_name' => ['required', 'string', 'max:255'],
            'channel' => ['required', 'string', 'in:trustlink,novapay,momo,bank'],
            'provider' => ['sometimes', 'nullable', 'string', 'max:50'],
            'identifier' => ['required', 'string', 'max:100'],
            'currency_code' => ['required', 'string', 'exists:currencies,code'],
            'is_favorite' => ['sometimes', 'boolean'],
        ];
    }
}
