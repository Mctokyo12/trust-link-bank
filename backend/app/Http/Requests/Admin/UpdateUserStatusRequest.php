<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseApiRequest;

class UpdateUserStatusRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:active,suspended,pending_kyc'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
