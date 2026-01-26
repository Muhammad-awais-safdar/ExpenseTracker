<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->loans()->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'person_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:given,taken',
            'due_date' => 'nullable|date',
            'status' => 'in:pending,paid',
            'description' => 'nullable|string',
        ]);

        $loan = $request->user()->loans()->create($validated);

        return response()->json($loan, 201);
    }

    public function show(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }
        return $loan;
    }

    public function update(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'person_name' => 'string|max:255',
            'amount' => 'numeric|min:0.01',
            'type' => 'in:given,taken',
            'due_date' => 'nullable|date',
            'status' => 'in:pending,paid',
            'description' => 'nullable|string',
        ]);

        $loan->update($validated);

        return $loan;
    }

    public function destroy(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }

        $loan->delete();

        return response()->noContent();
    }
}
