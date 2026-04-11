<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get a summary of the user's financial status for the dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // 1. All-time Summary
        $totalIncome = (float) $user->incomes()->sum('amount');
        $totalExpense = (float) $user->expenses()->sum('amount');
        
        // 2. Selected Month Stats
        $monthlyIncome = (float) $user->incomes()->whereBetween('date', [$startDate, $endDate])->sum('amount');
        $monthlyExpense = (float) $user->expenses()->whereBetween('date', [$startDate, $endDate])->sum('amount');

        // 3. Active Loans
        $loansGiven = (float) $user->loans()->where('type', 'given')->where('status', 'pending')->sum('amount');
        $loansTaken = (float) $user->loans()->where('type', 'taken')->where('status', 'pending')->sum('amount');

        // 4. Category Breakdown (Expenses for selected month)
        $categoryBreakdown = $user->expenses()
            ->whereBetween('date', [$startDate, $endDate])
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name', 'categories.color', 'categories.icon', DB::raw('SUM(amount) as total'))
            ->groupBy('categories.id', 'categories.name', 'categories.color', 'categories.icon')
            ->get()
            ->map(function ($item) {
                $item->total = (float) $item->total;
                return $item;
            });

        // 5. Recent Transactions (Mixed)
        $recentExpenses = $user->expenses()->with('category')->latest('date')->limit(10)->get();
        $recentIncomes = $user->incomes()->with('category')->latest('date')->limit(10)->get();

        $recentTransactions = $recentExpenses->concat($recentIncomes)
            ->sortByDesc('date')
            ->values()
            ->take(5)
            ->map(function ($item) {
                $item->amount = (float) $item->amount;
                $item->transaction_type = $item instanceof \App\Models\Expense ? 'expense' : 'income';
                return $item;
            });

        // 6. Monthly Trend (Daily spend for trend chart)
        $driver = DB::getDriverName();
        $dateFunc = $driver === 'pgsql' ? 'to_char(date, \'YYYY-MM-DD\')' : 'DATE_FORMAT(date, \'%Y-%m-%d\')';

        $dailyTrend = $user->expenses()
            ->whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw("$dateFunc as day"), DB::raw('SUM(amount) as total'))
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function ($item) {
                $item->total = (float) $item->total;
                return $item;
            });

        return response()->json([
            'meta' => [
                'month' => $month,
                'year' => $year,
                'period' => $startDate->format('F Y'),
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $totalIncome - $totalExpense,
                'monthly_income' => $monthlyIncome,
                'monthly_expense' => $monthlyExpense,
            ],
            'loans' => [
                'pending_given' => $loansGiven,
                'pending_taken' => $loansTaken,
            ],
            'recent_transactions' => $recentTransactions,
            'category_breakdown' => $categoryBreakdown,
            'daily_trend' => $dailyTrend,
        ]);
    }
}
