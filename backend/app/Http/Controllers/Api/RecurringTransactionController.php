<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreRecurringTransactionRequest;
use App\Http\Requests\Api\UpdateRecurringTransactionRequest;

class RecurringTransactionController extends Controller
{
    private function transformRecurring($recurring)
    {
        $recurring->amount = (float) $recurring->amount;
        if (!$recurring->relationLoaded('category') || !$recurring->category) {
            $recurring->setRelation('category', (object)[
                'id' => 0,
                'name' => 'Uncategorized',
                'color' => '#808080',
                'icon' => 'help-circle'
            ]);
        }
        return $recurring;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $recurring = $request->user()->recurringTransactions()->with('category')->latest()->get();
        return response()->json($recurring->map(fn($item) => $this->transformRecurring($item))->values()->all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRecurringTransactionRequest $request)
    {
        $recurring = $request->user()->recurringTransactions()->create($request->validated());
        
        return response()->json(
            $this->transformRecurring($recurring->load('category')), 
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $this->transformRecurring($recurringTransaction->load('category'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $recurringTransaction->update($request->validated());

        return $this->transformRecurring($recurringTransaction->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $recurringTransaction->delete();

        return response()->noContent();
    }
}
