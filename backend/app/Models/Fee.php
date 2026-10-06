<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fee extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'currency_id',
        'fixed_amount',
        'percentage',
        'min_fee',
        'max_fee',
    ];

    protected $casts = [
        'fixed_amount' => 'string',
        'percentage' => 'string',
        'min_fee' => 'string',
        'max_fee' => 'string',
    ];

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
