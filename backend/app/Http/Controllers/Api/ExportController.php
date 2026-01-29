<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function export(Request $request)
    {
        $user = $request->user();

        // Reusing logic from TransactionController kind of, but streamlined for export
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($user, $search, $categoryId, $startDate, $endDate) {
            $file = fopen('php://output', 'w');

            // Header Row - Ledger Style
            fputcsv($file, ['ID', 'Date', 'Type', 'Category/Title', 'Description/Source', 'Debit', 'Credit']);

            // Expenses
            $expenses = DB::table('expenses')
                ->where('expenses.user_id', $user->id)
                ->leftJoin('categories', 'expenses.category_id', '=', 'categories.id')
                ->select(
                    'expenses.id', 
                    'expenses.date', 
                    DB::raw("'Expense' as type"), 
                    'categories.name as category_name', 
                    'expenses.amount', 
                    'expenses.description'
                );

            if ($startDate) $expenses->where('expenses.date', '>=', $startDate);
            if ($endDate) $expenses->where('expenses.date', '<=', $endDate);
            if ($categoryId) $expenses->where('expenses.category_id', $categoryId);
            if ($search) $expenses->where('expenses.description', 'like', "%{$search}%");

            // Incomes
            $incomes = DB::table('incomes')
                ->where('incomes.user_id', $user->id)
                ->leftJoin('categories', 'incomes.category_id', '=', 'categories.id')
                ->select(
                    'incomes.id', 
                    'incomes.date', 
                    DB::raw("'Income' as type"), 
                    'categories.name as category_name', 
                    'incomes.amount', 
                    'incomes.source as description'
                );

            if ($startDate) $incomes->where('incomes.date', '>=', $startDate);
            if ($endDate) $incomes->where('incomes.date', '<=', $endDate);
            if ($categoryId) $incomes->where('incomes.category_id', $categoryId);
            if ($search) $incomes->where('incomes.source', 'like', "%{$search}%");

            // Loans
            $loans = DB::table('loans')
                ->where('loans.user_id', $user->id)
                ->select(
                    'loans.id', 
                    'loans.due_date as date', 
                    DB::raw("CASE WHEN type = 'given' THEN 'Loan Given' ELSE 'Loan Taken' END as type"), 
                    DB::raw("'Loan' as category_name"), 
                    'loans.amount', 
                    'loans.person_name as description'
                );

            if ($startDate) $loans->where('loans.due_date', '>=', $startDate);
            if ($endDate) $loans->where('loans.due_date', '<=', $endDate);
            if ($search) $loans->where('loans.person_name', 'like', "%{$search}%");

            // Build Union Use
            $query = $expenses->union($incomes);
            if (!$categoryId) {
                $query = $query->union($loans);
            }
            
            $query->orderBy('date', 'desc');
            $rows = $query->get();

            foreach ($rows as $row) {
                // Determine Debit/Credit
                $debit = null;
                $credit = null;

                if ($row->type === 'Expense' || $row->type === 'Loan Given') {
                    $debit = $row->amount;
                } else {
                    $credit = $row->amount;
                }

                fputcsv($file, [
                    $row->id,
                    $row->date,
                    $row->type,
                    $row->category_name ?? '', // Empty string if null
                    $row->description,
                    $debit,  // Debit Column
                    $credit, // Credit Column
                ]);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
