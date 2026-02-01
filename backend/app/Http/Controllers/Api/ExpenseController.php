<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $expense = $request->user()->expenses()->create($validated);
        return response()->json($this->transformExpense($expense->load('category')), 201);
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            abort(403);
        }
        return $this->transformExpense($expense->load('category'));
    }

    public function update(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'numeric|min:0.01',
            'description' => 'nullable|string',
            'date' => 'date',
        ]);

        $expense->update($validated);
        return $this->transformExpense($expense->load('category'));
    }

    public function destroy(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            abort(403);
        }

        $expense->delete();

        return response()->noContent();
    }
}
