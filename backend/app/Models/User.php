<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'branch_id',
        'name',
        'email',
        'password',
        'role',
        'lang',
        'notify_email',
        'notify_my_schedule',
        'notify_all_schedule',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'notify_email' => 'boolean',
        'notify_my_schedule' => 'boolean',
        'notify_all_schedule' => 'boolean',
    ];

    // JWT用メソッド
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    // リレーション
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_users', 'user_id', 'event_id');
    }

    public function organizedEvents()
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }
}