<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->expenses()->with('category')->latest('date')->paginate(20);
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

        return response()->json($expense->load('category'), 201);
    }

    public function show(Request $request, Expense $expense)
    {
        if ($expense->user_id !== $request->user()->id) {
            abort(403);
        }
        return $expense->load('category');
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

        return $expense->load('category');
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
