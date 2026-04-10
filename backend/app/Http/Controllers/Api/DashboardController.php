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

        // Get requested month/year or default to current
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        
        // Calculate start and end date for the selected period
        $startDate = \Carbon\Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Active Loans (for display only)
        $loansGiven = (float) $user->loans()->where('type', 'given')->where('status', 'pending')->sum('amount');
        $loansTaken = (float) $user->loans()->where('type', 'taken')->where('status', 'pending')->sum('amount');
        
        // Total Income & Expense (All time)
        $totalIncome = (float) $user->incomes()->sum('amount');
        $totalExpense = (float) $user->expenses()->sum('amount');
        
        // Balance (All time)
        $balance = $totalIncome - $totalExpense;

        // Monthly Stats (For Selected Month)
        $monthlyIncome = (float) $user->incomes()->whereBetween('date', [$startDate, $endDate])->sum('amount');
        $monthlyExpense = (float) $user->expenses()->whereBetween('date', [$startDate, $endDate])->sum('amount');

        // Category Breakdown (For Selected Month)
        $expenseByCategory = $user->expenses()
            ->whereBetween('date', [$startDate, $endDate])
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

        // Recent Transactions (limit 5, For Selected Month)
        $recentExpenses = $user->expenses()
            ->whereBetween('date', [$startDate, $endDate])
            ->with('category:id,name,icon,color')
            ->latest('date')
            ->limit(5)
            ->get()
            ->map(fn($item) => $formatTransaction($item, 'expense'));

        $recentIncomes = $user->incomes()
            ->whereBetween('date', [$startDate, $endDate])
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

        // 6-Month Trend Data (Based on selected year/month backwards)
        $trendStartDate = $startDate->copy()->subMonths(5)->startOfMonth();
        
        $incomeData = $user->incomes()
            ->whereBetween('date', [$trendStartDate, $endDate])
            ->selectRaw("to_char(date, 'YYYY') as year, to_char(date, 'MM') as month, sum(amount) as total")
            ->groupBy('year', 'month')
            ->get();

        $expenseData = $user->expenses()
            ->whereBetween('date', [$trendStartDate, $endDate])
            ->selectRaw("to_char(date, 'YYYY') as year, to_char(date, 'MM') as month, sum(amount) as total")
            ->groupBy('year', 'month')
            ->get();

        $trends = collect(range(0, 5))->map(function ($i) use ($incomeData, $expenseData, $startDate) {
            $date = $startDate->copy()->subMonths($i);
            $yearStr = $date->format('Y');
            $monthStr = $date->format('m');
            $monthLabel = $date->format('M');

            // Find matching data in collection (done in memory, much faster than DB query loop)
            $income = $incomeData->first(fn($item) => $item->year == $yearStr && $item->month == $monthStr)?->total ?? 0;
            $expense = $expenseData->first(fn($item) => $item->year == $yearStr && $item->month == $monthStr)?->total ?? 0;

            return [
                'month' => $monthLabel,
                'income' => (float) $income,
                'expense' => (float) $expense
            ];
        })->reverse()->values(); 

        return response()->json([
            'meta' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString()
            ],
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
