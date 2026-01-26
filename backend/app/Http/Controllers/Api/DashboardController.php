<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Total Income & Expense (All time)
        $totalIncome = $user->incomes()->sum('amount');
        $totalExpense = $user->expenses()->sum('amount');
        $balance = $totalIncome - $totalExpense;

        // Monthly Stats (Current Month)
        $currentMonth = now()->startOfMonth();
        $monthlyIncome = $user->incomes()->where('date', '>=', $currentMonth)->sum('amount');
        $monthlyExpense = $user->expenses()->where('date', '>=', $currentMonth)->sum('amount');

        // Category Breakdown
        $expenseByCategory = $user->expenses()
            ->select('category_id', DB::raw('sum(amount) as total'))
            ->with(['category:id,name,color,icon'])
            ->groupBy('category_id')
            ->get();

        // Recent Transactions (limit 5)
        $recentExpenses = $user->expenses()->with('category:id,name,icon,color')->latest('date')->limit(5)->get()->map(function($item) {
            $item->type = 'expense';
            return $item;
        });
        $recentIncomes = $user->incomes()->with('category:id,name,icon,color')->latest('date')->limit(5)->get()->map(function($item) {
            $item->type = 'income';
            return $item;
        });
        
        // Merge and sort
        $recentTransactions = $recentExpenses->merge($recentIncomes)->sortByDesc('date')->take(5)->values();

        // Loans
        $loansGiven = $user->loans()->where('type', 'given')->where('status', 'pending')->sum('amount');
        $loansTaken = $user->loans()->where('type', 'taken')->where('status', 'pending')->sum('amount');

        return response()->json([
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $balance,
                'monthly_income' => $monthlyIncome,
                'monthly_expense' => $monthlyExpense,
            ],
            'expense_by_category' => $expenseByCategory,
            'recent_transactions' => $recentTransactions,
            'loans' => [
                'given_pending' => $loansGiven,
                'taken_pending' => $loansTaken
            ]
        ]);
    }
}
