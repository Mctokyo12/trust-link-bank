<?php

namespace App\Http\Requests;

class ForgotPasswordRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
        ];
    }
}
