<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreBudgetRequest;
use App\Http\Requests\Api\UpdateBudgetRequest;

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
            
            $budget->spent = (float) $spent;
            $budget->percentage = $budget->amount > 0 ? min(100, round(($spent / $budget->amount) * 100)) : 0;
            return $budget;
        });

        return response()->json($budgets->values()->all());
    }

    public function store(StoreBudgetRequest $request)
    {
        $budget = $request->user()->budgets()->create($request->validated());

        return response()->json($budget->load('category'), 201);
    }

    public function show(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $budget->load('category');
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $budget->update($request->validated());

        return $budget->load('category');
    }

    public function destroy(Request $request, Budget $budget)
    {
        if ($budget->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $budget->delete();

        return response()->noContent();
    }
}
