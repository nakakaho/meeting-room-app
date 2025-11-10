<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $primaryKey = 'branch_id';
    public $timestamps = true;

    protected $fillable = [
        'branch_name',
        'lang',
        'timezone',
    ];

    // リレーション
    public function users()
    {
        return $this->hasMany(User::class, 'branch_id', 'branch_id');
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'branch_id', 'branch_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'branch_id', 'branch_id');
    }
}
