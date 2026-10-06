<?php

namespace App\Http\Requests;

class LoginRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            // Accepts email, phone, or novatag in 'identifier' or 'email'
            'identifier' => ['required_without:email', 'string'],
            'email' => ['required_without:identifier', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'string'],
        ];
    }
}
