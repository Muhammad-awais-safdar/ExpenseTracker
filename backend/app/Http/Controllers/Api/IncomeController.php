<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Income;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    private function transformIncome($income)
    {
        $income->amount = (float) $income->amount;
        if (!$income->relationLoaded('category') || !$income->category) {
            $income->setRelation('category', (object)[
                'id' => 0,
                'name' => 'Uncategorized',
                'color' => '#808080',
                'icon' => 'help-circle'
            ]);
        }
        return $income;
    }

    public function index(Request $request)
    {
        $incomes = $request->user()->incomes()->with('category')->latest('date')->paginate(20);
        $incomes->getCollection()->transform(fn($item) => $this->transformIncome($item));
        return $incomes;
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
        return response()->json($this->transformIncome($income->load('category')), 201);
    }

    public function show(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            abort(403);
        }
        return $this->transformIncome($income->load('category'));
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
        return $this->transformIncome($income->load('category'));
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
