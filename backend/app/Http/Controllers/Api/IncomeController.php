<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Income;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreIncomeRequest;
use App\Http\Requests\Api\UpdateIncomeRequest;

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

    public function store(StoreIncomeRequest $request)
    {
        $validated = $request->validated();
        
        $income = $request->user()->incomes()->create($validated);
        
        return response()->json(
            $this->transformIncome($income->load('category')), 
            201
        );
    }

    public function show(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $this->transformIncome($income->load('category'));
    }

    public function update(UpdateIncomeRequest $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $income->update($request->validated());
        
        return $this->transformIncome($income->load('category'));
    }

    public function destroy(Request $request, Income $income)
    {
        if ($income->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $income->delete();

        return response()->noContent();
    }
}
