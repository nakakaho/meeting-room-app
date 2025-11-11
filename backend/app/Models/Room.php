<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';
    protected $primaryKey = 'room_id';
    
    public $timestamps = true;

    protected $fillable = [
        'branch_id',
        'room_name',
        'capacity',
        'facility',
    ];

    // リレーション
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id', 'branch_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'room_id', 'room_id');
    }
}