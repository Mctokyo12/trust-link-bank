<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'available',
        'pending',
        'last_reconciled_at',
    ];

    protected $casts = [
        'available' => 'string', // Keep as string for precision via BCMath
        'pending' => 'string',
        'last_reconciled_at' => 'datetime',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
