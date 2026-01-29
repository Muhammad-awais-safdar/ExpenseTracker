<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecurringTransaction;
use Illuminate\Http\Request;

class RecurringTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return $request->user()->recurringTransactions()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:expense,income',
            'amount' => 'required|numeric',
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'start_date' => 'required|date',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['next_run_date'] = $validated['start_date']; // Initial next run is start date if in future, typically logic might vary but let's assume it starts on start_date
        $validated['is_active'] = true;

        $recurring = RecurringTransaction::create($validated);

        // If the start date is today or in the past, process it immediately
        if (\Carbon\Carbon::parse($validated['start_date'])->lte(\Carbon\Carbon::today())) {
            \Illuminate\Support\Facades\Artisan::call('recurring:process');
        }

        return response()->json($recurring, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('view', $recurringTransaction);
        return $recurringTransaction;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        // Simple authorization check since we don't have Policy setup yet for this
        if ($request->user()->id !== $recurringTransaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|in:expense,income',
            'amount' => 'sometimes|numeric',
            'title' => 'sometimes|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'frequency' => 'sometimes|in:daily,weekly,monthly,yearly',
            'start_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
        ]);
        
        // If frequency or start_date changed, might need to re-calc next_run_date? 
        // For simplicity, if user edits, we just update fields. User can manually set next_run if needed or we keep it as is.
        // Let's implicitly assume if they change start_date or frequency, they might expect it to reset. 
        // For now, simple update.

        $recurringTransaction->update($validated);

        return response()->json($recurringTransaction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($request->user()->id !== $recurringTransaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $recurringTransaction->delete();

        return response()->json(['message' => 'Recurring transaction deleted']);
    }
}
