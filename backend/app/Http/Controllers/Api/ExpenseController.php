<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreExpenseRequest;
use App\Http\Requests\Api\UpdateExpenseRequest;

class ExpenseController extends Controller
{
    private function transformExpense($expense)
    {
        $expense->amount = (float) $expense->amount;
        if (!$expense->relationLoaded('category') || !$expense->category) {
            $expense->setRelation('category', (object)[
                'id' => 0,
                'name' => 'Uncategorized',
                'color' => '#808080',
                'icon' => 'help-circle'
            ]);
        }
        return $expense;
    }

    public function index(Request $request)
    {
        $expenses = $request->user()->expenses()->with('category')->latest('date')->paginate(20);
        $expenses->getCollection()->transform(fn($item) => $this->transformExpense($item));
        return $expenses;
    }

    public function store(StoreExpenseRequest $request)
    {
        $validated = $request->validated();
        
        $expense = $request->user()->expenses()->create($validated);
        
        return response()->json(
            $this->transformExpense($expense->load('category')), 
            201
        );
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $this->transformExpense($expense->load('category'));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $expense->update($request->validated());
        
        return $this->transformExpense($expense->load('category'));
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $expense->delete();

        return response()->noContent();
    }
}
