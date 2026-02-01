<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingTransaction extends Model
{
    protected $fillable = ['saving_goal_id', 'type', 'amount', 'date', 'note'];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];

    public function goal()
    {
        return $this->belongsTo(SavingGoal::class, 'saving_goal_id');
    }
}
