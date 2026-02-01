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

        // Active Loans (for display only)
        $loansGiven = (float) $user->loans()->where('type', 'given')->where('status', 'pending')->sum('amount');
        $loansTaken = (float) $user->loans()->where('type', 'taken')->where('status', 'pending')->sum('amount');
        
        // Total Income & Expense (All time)
        $totalIncome = (float) $user->incomes()->sum('amount');
        $totalExpense = (float) $user->expenses()->sum('amount');
        
        // Balance
        $balance = $totalIncome - $totalExpense;

        // Monthly Stats (Current Month)
        $currentMonth = now()->startOfMonth();
        $monthlyIncome = (float) $user->incomes()->where('date', '>=', $currentMonth)->sum('amount');
        $monthlyExpense = (float) $user->expenses()->where('date', '>=', $currentMonth)->sum('amount');

        // Category Breakdown
        $expenseByCategory = $user->expenses()
            ->select('category_id', DB::raw('sum(amount) as total'))
            ->with(['category:id,name,color,icon'])
            ->groupBy('category_id')
            ->get()
            ->map(function($item) {
                return [
                    'category_id' => $item->category_id,
                    'total' => (float) $item->total,
                    'category' => $item->category ?? [
                        'id' => 0,
                        'name' => 'Uncategorized',
                        'color' => '#808080',
                        'icon' => 'help-circle'
                    ]
                ];
            });

        // Helper to format transactions safely
        $formatTransaction = function($item, $type) {
            $item->type = $type;
            $item->amount = (float) $item->amount;
            // Ensure category object exists to prevent app crash
            if (!$item->relationLoaded('category') || !$item->category) {
                $item->setRelation('category', (object)[
                    'id' => 0,
                    'name' => 'Uncategorized',
                    'color' => '#808080',
                    'icon' => 'help-circle'
                ]);
            }
            return $item;
        };

        // Recent Transactions (limit 5)
        $recentExpenses = $user->expenses()
            ->with('category:id,name,icon,color')
            ->latest('date')
            ->limit(5)
            ->get()
            ->map(fn($item) => $formatTransaction($item, 'expense'));

        $recentIncomes = $user->incomes()
            ->with('category:id,name,icon,color')
            ->latest('date')
            ->limit(5)
            ->get()
            ->map(fn($item) => $formatTransaction($item, 'income'));
        
        // Merge and sort
        $recentTransactions = $recentExpenses->merge($recentIncomes)
            ->sort(function ($a, $b) {
                if ($a->date == $b->date) {
                    return $b->created_at <=> $a->created_at; 
                }
                return $b->date <=> $a->date; 
            })
            ->take(5)
            ->values();

        // 6-Month Trend Data
        $trends = collect(range(0, 5))->map(function ($i) use ($user) {
            $date = now()->subMonths($i);
            $month = $date->format('M'); 
            $monthNum = $date->month;
            $year = $date->year;

            $income = (float) $user->incomes()
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            $expense = (float) $user->expenses()
                ->whereYear('date', $year)
                ->whereMonth('date', $monthNum)
                ->sum('amount');

            return [
                'month' => $month,
                'income' => $income,
                'expense' => $expense
            ];
        })->reverse()->values(); 

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
            ],
            'trends' => $trends
        ]);
    }
}
