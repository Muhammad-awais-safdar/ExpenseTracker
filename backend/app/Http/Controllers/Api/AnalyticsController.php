<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Expense;
use App\Models\Income;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get detailed analytics for the user's finances.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Determine the active date range based on period
        $period = $request->query('period', 'month');
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        $startDateParam = $request->query('start_date');
        $endDateParam = $request->query('end_date');

        switch ($period) {
            case 'day':
                $selectedRangeStart = Carbon::now()->startOfDay();
                $selectedRangeEnd = Carbon::now()->endOfDay();
                break;
            case 'week':
                $selectedRangeStart = Carbon::now()->startOfWeek();
                $selectedRangeEnd = Carbon::now()->endOfWeek();
                break;
            case 'year':
                $selectedRangeStart = Carbon::createFromDate($year, 1, 1)->startOfYear();
                $selectedRangeEnd = $selectedRangeStart->copy()->endOfYear();
                break;
            case 'custom':
                $selectedRangeStart = $startDateParam ? Carbon::parse($startDateParam)->startOfDay() : Carbon::now()->startOfMonth();
                $selectedRangeEnd = $endDateParam ? Carbon::parse($endDateParam)->endOfDay() : Carbon::now()->endOfMonth();
                break;
            case 'month':
            default:
                $selectedRangeStart = Carbon::createFromDate($year, $month, 1)->startOfMonth();
                $selectedRangeEnd = $selectedRangeStart->copy()->endOfMonth();
                break;
        }

        // 2. Dynamic period for trends (always show context leading up to the end of selected range)
        $monthsToView = (int) $request->query('months', 6);
        $endDate = $selectedRangeEnd;
        $startDate = $selectedRangeStart->copy()->subMonths($monthsToView - 1)->startOfMonth();

        // Cross-database date formatting
        $driver = DB::getDriverName();
        $monthFormat = $driver === 'pgsql' ? 'to_char(date, \'YYYY-MM\')' : 'DATE_FORMAT(date, \'%Y-%m\')';

        // 1. Monthly Trends
        $incomeTrends = $user->incomes()
            ->whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw("$monthFormat as month"), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $expenseTrends = $user->expenses()
            ->whereBetween('date', [$startDate, $endDate])
            ->select(DB::raw("$monthFormat as month"), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Format trends for frontend (ensuring every month has a value)
        $trends = [];
        for ($i = $monthsToView - 1; $i >= 0; $i--) {
            $currentMonth = $endDate->copy()->subMonths($i);
            $monthKey = $currentMonth->format('Y-m');
            $monthLabel = $currentMonth->format('M Y');
            
            $trends[] = [
                'month' => $monthKey,
                'label' => $monthLabel,
                'income' => (float) ($incomeTrends->firstWhere('month', $monthKey)->total ?? 0),
                'expense' => (float) ($expenseTrends->firstWhere('month', $monthKey)->total ?? 0),
            ];
        }

        // 2. Spending by Category (Scoped to selected period/range)
        $spendingByCategory = $user->expenses()
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->whereBetween('expenses.date', [$selectedRangeStart, $selectedRangeEnd])
            ->select('categories.name', 'categories.color', 'categories.icon', DB::raw('SUM(amount) as total'))
            ->groupBy('categories.id', 'categories.name', 'categories.color', 'categories.icon')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                $item->total = (float) $item->total;
                return $item;
            });

        // Calculate total for percentages
        $totalMonthExpense = $spendingByCategory->sum('total');
        $spendingByCategory->transform(function ($item) use ($totalMonthExpense) {
            $item->percentage = $totalMonthExpense > 0 ? round(($item->total / $totalMonthExpense) * 100, 1) : 0;
            return $item;
        });

        // 3. Key Performance Indicators (KPIs for selected period)
        $totalIncome = (float) $user->incomes()->whereBetween('date', [$selectedRangeStart, $selectedRangeEnd])->sum('amount');
        $totalExpense = (float) $totalMonthExpense;
        $averageMonthlyExpense = $monthsToView > 0 ? (float) ($totalExpense / $monthsToView) : 0;

        return response()->json([
            'meta' => [
                'period' => $period,
                'month' => (int) $month,
                'year' => (int) $year,
                'start_date' => $selectedRangeStart->toDateString(),
                'end_date' => $selectedRangeEnd->toDateString()
            ],
            'chart_data' => $trends,
            'categories' => $spendingByCategory,
            'summary' => [
                'income' => $totalIncome,
                'expense' => $totalExpense,
                'savings' => $totalIncome - $totalExpense,
                'savings_rate' => $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 2) : 0,
                'avg_monthly_expense' => round($averageMonthlyExpense, 2),
            ]
        ]);
    }
}
