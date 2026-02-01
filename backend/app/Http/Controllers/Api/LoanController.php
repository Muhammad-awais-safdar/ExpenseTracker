<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    private function transformLoan($loan)
    {
        $loan->amount = (float) $loan->amount;
        return $loan;
    }

    public function index(Request $request)
    {
        $loans = $request->user()->loans()->latest()->get();
        return $loans->map(fn($item) => $this->transformLoan($item));
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

        // Create immediate transaction reflecting cash flow
        if ($loan->type === 'taken') {
            // Money In -> Income
            $request->user()->incomes()->create([
                'amount' => $loan->amount,
                'source' => 'Loan Taken: ' . $loan->person_name,
                'date' => now(),
                'category_id' => null
            ]);
        } else {
            // Money Out -> Expense
            $request->user()->expenses()->create([
                'amount' => $loan->amount,
                'description' => 'Loan Given: ' . $loan->person_name,
                'date' => now(),
                'category_id' => null
            ]);
        }

        return response()->json($this->transformLoan($loan), 201);
    }

    public function show(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }
        return $this->transformLoan($loan);
    }

    public function update(Request $request, Loan $loan)
    {
        \Illuminate\Support\Facades\Log::info('Update Loan Request', [
            'loan_id' => $loan->id,
            'input' => $request->all()
        ]);

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

        \Illuminate\Support\Facades\Log::info('Validated Data', $validated);

        // Check if status is changing to 'paid'
        $wasPending = $loan->status === 'pending';
        $isNowPaid = isset($validated['status']) && $validated['status'] === 'paid';

        $loan->update($validated);
        
        if ($wasPending && $isNowPaid) {
            \Illuminate\Support\Facades\Log::info('Loan Settled - Creating Transaction');
            
            if ($loan->type === 'given') {
                // I lent money, now getting it back -> Income
                $request->user()->incomes()->create([
                    'amount' => $loan->amount,
                    'source' => 'Loan Repayment: ' . $loan->person_name,
                    'date' => now(),
                    'category_id' => null // Or create a specific category if needed
                ]);
            } else {
                // I borrowed money, now paying it back -> Expense
                $request->user()->expenses()->create([
                    'amount' => $loan->amount,
                    'description' => 'Loan Repayment: ' . $loan->person_name,
                    'date' => now(),
                    'category_id' => null
                ]);
            }
        }
        
        \Illuminate\Support\Facades\Log::info('Loan Updated', $loan->fresh()->toArray());

        return $this->transformLoan($loan);
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
