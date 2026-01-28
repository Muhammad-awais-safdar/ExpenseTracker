<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $budgets = $request->user()->budgets()->with('category')->latest()->get();

        // Calculate usage for each budget
        $budgets = $budgets->map(function ($budget) use ($request) {
            $spent = $request->user()->expenses()
                ->where('category_id', $budget->category_id)
                ->whereBetween('date', [$budget->start_date, $budget->end_date])
                ->sum('amount');
            
            $budget->spent = $spent;
            $budget->percentage = $budget->amount > 0 ? min(100, round(($spent / $budget->amount) * 100)) : 0;
            return $budget;
        });

        return $budgets;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'period' => 'required|in:monthly,yearly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $budget = $request->user()->budgets()->create($validated);

        return response()->json($budget->load('category'), 201);
    }

    public function show(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }
        return $budget->load('category');
    }

    public function update(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'category_id' => 'exists:categories,id',
            'amount' => 'numeric|min:0.01',
            'period' => 'in:monthly,yearly',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
        ]);

        $budget->update($validated);

        return $budget->load('category');
    }

    public function destroy(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        $budget->delete();

        return response()->noContent();
    }
}
