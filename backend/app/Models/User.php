<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ⭐ 追加
use Laravel\Sanctum\NewAccessToken;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // ⭐ HasApiTokensを追加

    protected $fillable = [
        'branch_id',
        'name',
        'email',
        'password',
        'role',
        'lang',
        'notify_email',
        'notify_my_schedule',
        // 'notify_all_schedule',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'notify_email' => 'boolean',
        'notify_my_schedule' => 'boolean',
        // 'notify_all_schedule' => 'boolean',
    ];

    // リレーション
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_users', 'user_id', 'event_id')
                    ->withTimestamps();
    }

    public function organizedEvents()
    {
        return $this->hasMany(Event::class, 'organizer_id');
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_users', 'event_id', 'user_id')
                    ->withTimestamps();
    }

}