<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'kyc_profile_id',
        'type',
        'document_number',
        'file_path',
        'status',
        'notes',
    ];

    public function kycProfile(): BelongsTo
    {
        return $this->belongsTo(KycProfile::class);
    }
}
