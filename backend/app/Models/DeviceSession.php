<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device',
        'browser',
        'platform',
        'ip_hash',
        'ip_address',
        'location',
        'is_current',
        'last_seen',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'last_seen' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
