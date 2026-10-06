<?php

namespace App\Http\Requests;

class UpdateProfileRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', "unique:users,email,{$userId}"],
            'phone' => ['sometimes', 'string', 'max:30', "unique:users,phone,{$userId}"],
            'language' => ['sometimes', 'string', 'in:fr,en'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'url'],
        ];
    }
}
