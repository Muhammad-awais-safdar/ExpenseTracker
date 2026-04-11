<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreLoanRequest;
use App\Http\Requests\Api\UpdateLoanRequest;

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

    public function store(StoreLoanRequest $request)
    {
        $validated = $request->validated();

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
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $this->transformLoan($loan);
    }

    public function update(UpdateLoanRequest $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $validated = $request->validated();

        // Check if status is changing to 'paid'
        $wasPending = $loan->status === 'pending';
        $isNowPaid = isset($validated['status']) && $validated['status'] === 'paid';

        $loan->update($validated);
        
        if ($wasPending && $isNowPaid) {
            if ($loan->type === 'given') {
                // I lent money, now getting it back -> Income
                $request->user()->incomes()->create([
                    'amount' => $loan->amount,
                    'source' => 'Loan Repayment: ' . $loan->person_name,
                    'date' => now(),
                    'category_id' => null
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

        return $this->transformLoan($loan);
    }

    public function destroy(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $loan->delete();

        return response()->noContent();
    }
}
