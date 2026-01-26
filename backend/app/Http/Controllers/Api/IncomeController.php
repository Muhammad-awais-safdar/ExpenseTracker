<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Income;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->incomes()->with('category')->latest('date')->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'source' => 'nullable|string',
            'date' => 'required|date',
        ]);

        $income = $request->user()->incomes()->create($validated);

        return response()->json($income->load('category'), 201);
    }

    public function show(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            abort(403);
        }
        return $income->load('category');
    }

    public function update(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount' => 'numeric|min:0.01',
            'source' => 'nullable|string',
            'date' => 'date',
        ]);

        $income->update($validated);

        return $income->load('category');
    }

    public function destroy(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            abort(403);
        }

        $income->delete();

        return response()->noContent();
    }
}
