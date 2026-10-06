<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionEntry extends Model
{
    use HasFactory;

    public $timestamps = false; // Only created_at is present

    protected $fillable = [
        'transaction_id',
        'wallet_id',
        'direction',
        'amount',
        'entry_type',
        'created_at',
    ];

    protected $casts = [
        'amount' => 'string',
        'created_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
