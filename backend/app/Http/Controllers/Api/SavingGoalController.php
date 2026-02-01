<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SavingGoal;
use App\Models\SavingTransaction;
use Illuminate\Support\Facades\DB;

class SavingGoalController extends Controller
{
    public function index(Request $request)
    {
        $goals = $request->user()->savingGoals()
            ->with(['transactions' => function($q) {
                $q->latest('date')->limit(5);
            }])
            ->get()
            ->map(function ($goal) {
                $goal->progress_percentage = $goal->target_amount > 0 
                    ? min(100, round(($goal->current_amount / $goal->target_amount) * 100, 1))
                    : 0;
                return $goal;
            });

        return response()->json($goals);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'target_date' => 'nullable|date',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'current_amount' => 'nullable|numeric|min:0'
        ]);

        $goal = $request->user()->savingGoals()->create([
            ...$validated,
            'current_amount' => $validated['current_amount'] ?? 0,
            'status' => 'active'
        ]);

        return response()->json($goal, 201);
    }

    public function show(SavingGoal $saving) // Route param is 'saving' from resource? No, custom route.
    {
        // Check binding in routes. Assuming /savings/{id}
        if ($saving->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $saving->load(['transactions' => function($q) {
            $q->latest('date');
        }]);
        
        $saving->progress_percentage = $saving->target_amount > 0 
             ? min(100, round(($saving->current_amount / $saving->target_amount) * 100, 1))
             : 0;

        return response()->json($saving);
    }

    public function update(Request $request, SavingGoal $saving)
    {
        if ($saving->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:1',
            'target_date' => 'nullable|date',
            'color' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'nullable|in:active,completed'
        ]);

        $saving->update($validated);

        return response()->json($saving);
    }

    public function destroy(Request $request, SavingGoal $saving)
    {
         if ($saving->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $saving->delete();
        return response()->json(['message' => 'Goal deleted']);
    }

    public function addTransaction(Request $request, $id)
    {
        $goal = SavingGoal::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'type' => 'required|in:deposit,withdraw',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'note' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $transaction = $goal->transactions()->create($validated);

            if ($validated['type'] === 'deposit') {
                $goal->increment('current_amount', $validated['amount']);
            } else {
                $goal->decrement('current_amount', $validated['amount']);
            }

            DB::commit();
            return response()->json([
                'message' => 'Transaction added',
                'goal' => $goal->fresh(),
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add transaction'], 500);
        }
    }
}
