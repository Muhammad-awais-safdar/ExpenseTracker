<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $period = $request->input('period', 'month'); // day, week, month, year, custom
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Determine Date Range
        if ($period === 'custom' && $startDate && $endDate) {
            $start = Carbon::parse($startDate)->startOfDay();
            $end = Carbon::parse($endDate)->endOfDay();
        } else {
            $end = now()->endOfDay();
            switch ($period) {
                case 'day':
                    $start = now()->startOfDay();
                    break;
                case 'week':
                    $start = now()->startOfWeek();
                    break;
                case 'month':
                    $start = now()->startOfMonth();
                    break;
                case 'year':
                    $start = now()->startOfYear();
                    break;
                default:
                    $start = now()->startOfMonth();
            }
        }

        // 1. Total Summary
        $totalIncome = (float) $user->incomes()
            ->whereBetween('date', [$start, $end])
            ->sum('amount');

        $totalExpense = (float) $user->expenses()
            ->whereBetween('date', [$start, $end])
            ->sum('amount');

        // 2. Expense Category Breakdown (Pie Chart)
        $expenseByCategory = $user->expenses()
            ->whereBetween('date', [$start, $end])
            ->select('category_id', DB::raw('sum(amount) as total'))
            ->with('category:id,name,color,icon')
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) use ($totalExpense) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'color' => $item->category->color ?? '#9CA3AF',
                    'icon' => $item->category->icon ?? 'help-circle',
                    'total' => (float) $item->total,
                    'percentage' => $totalExpense > 0 ? round(($item->total / $totalExpense) * 100, 1) : 0
                ];
            });

        // 3. Trend Chart Data (Line/Bar Chart)
        // Group by day for day/week/month views, by month for year view
        $groupBy = ($period === 'year') ? 'month' : 'day';
        $dateFormat = ($groupBy === 'month') ? 'YYYY-MM' : 'YYYY-MM-DD';
        
        // PostgreSQL date format
        $pgFormat = ($groupBy === 'month') ? 'YYYY-MM' : 'YYYY-MM-DD';

        $expensesTrend = $user->expenses()
            ->whereBetween('date', [$start, $end])
            ->select(DB::raw("to_char(date, '$pgFormat') as date_label"), DB::raw('sum(amount) as total'))
            ->groupBy('date_label')
            ->orderBy('date_label')
            ->get()
            ->pluck('total', 'date_label');

        $incomesTrend = $user->incomes()
            ->whereBetween('date', [$start, $end])
            ->select(DB::raw("to_char(date, '$pgFormat') as date_label"), DB::raw('sum(amount) as total'))
            ->groupBy('date_label')
            ->orderBy('date_label')
            ->get()
            ->pluck('total', 'date_label');

        // Fill missing dates
        $chartData = [];
        $current = $start->copy();
        
        while ($current <= $end) {
            $label = $current->format(($groupBy === 'month') ? 'Y-m' : 'Y-m-d');
            // User friendly label
            $displayLabel = ($groupBy === 'month') 
                ? $current->format('M') 
                : $current->format('d M'); // 01 Jan

            $chartData[] = [
                'label' => $displayLabel,
                'full_date' => $label,
                'expense' => (float) ($expensesTrend[$label] ?? 0),
                'income' => (float) ($incomesTrend[$label] ?? 0),
            ];

            if ($groupBy === 'month') {
                $current->addMonth();
            } else {
                $current->addDay();
            }
        }

        return response()->json([
            'period' => $period,
            'range' => [
                'start' => $start->toDateString(),
                'end' => $end->toDateString()
            ],
            'summary' => [
                'income' => $totalIncome,
                'expense' => $totalExpense,
                'savings' => $totalIncome - $totalExpense,
                'savings_rate' => $totalIncome > 0 ? round((($totalIncome - $totalExpense) / $totalIncome) * 100, 1) : 0
            ],
            'categories' => $expenseByCategory,
            'chart_data' => $chartData
        ]);
    }
}
