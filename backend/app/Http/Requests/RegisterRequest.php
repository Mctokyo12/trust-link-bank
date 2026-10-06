<?php

namespace App\Http\Requests;

class RegisterRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:6'],
            'country_code' => ['required', 'string', 'exists:countries,code'],
            'language' => ['sometimes', 'string', 'in:fr,en'],
            'otp_code' => ['sometimes', 'string'],
        ];
    }
}
