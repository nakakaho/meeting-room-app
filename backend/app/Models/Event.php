<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'events';
    protected $primaryKey = 'event_id';
    
    public $timestamps = true;

    protected $fillable = [
        'branch_id',
        'organizer_id',
        'room_id',
        'start_time',
        'end_time',
        'memo',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // リレーション
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'room_id');
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_users', 'event_id', 'user_id')
                    ->withTimestamps();
    }
}