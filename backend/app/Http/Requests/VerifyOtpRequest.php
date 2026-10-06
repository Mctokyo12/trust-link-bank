<?php

namespace App\Http\Requests;

class VerifyOtpRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'code' => ['required', 'string', 'min:4', 'max:8'],
        ];
    }
}
