<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Expenses Query
        $expenses = DB::table('expenses')
            ->where('expenses.user_id', $user->id)
            ->leftJoin('categories', 'expenses.category_id', '=', 'categories.id')
            ->select(
                'expenses.id',
                'expenses.amount',
                'expenses.date',
                'expenses.created_at',
                DB::raw("'expense' as type"),
                'expenses.description as title',
                'categories.id as cat_id',
                'categories.name as cat_name',
                'categories.icon as cat_icon',
                'categories.color as cat_color'
            );

        // Incomes Query
        $incomes = DB::table('incomes')
            ->where('incomes.user_id', $user->id)
            ->leftJoin('categories', 'incomes.category_id', '=', 'categories.id')
            ->select(
                'incomes.id',
                'incomes.amount',
                'incomes.date',
                'incomes.created_at',
                DB::raw("'income' as type"),
                'incomes.source as title',
                'categories.id as cat_id',
                'categories.name as cat_name',
                'categories.icon as cat_icon',
                'categories.color as cat_color'
            );

        // Loans Query
        $loans = DB::table('loans')
            ->where('loans.user_id', $user->id)
            ->select(
                'loans.id',
                'loans.amount',
                'loans.due_date as date', // Alias due_date to date for union compatibility
                'loans.created_at',
                DB::raw("CASE WHEN type = 'given' THEN 'loan_given' ELSE 'loan_taken' END as type"),
                'loans.person_name as title', // Use person_name instead of person
                DB::raw("NULL as cat_id"),
                DB::raw("NULL as cat_name"),
                DB::raw("NULL as cat_icon"),
                DB::raw("NULL as cat_color")
            );

        // Union All
        $query = $expenses->union($incomes)->union($loans);
        
        $query->orderBy('date', 'desc')
              ->orderBy('created_at', 'desc');

        $transactions = $query->paginate(20);

        // Transform collection to restore nested category structure for frontend
        $transactions->getCollection()->transform(function ($item) {
            if ($item->cat_id) {
                $item->category = [
                    'id' => $item->cat_id,
                    'name' => $item->cat_name,
                    'icon' => $item->cat_icon,
                    'color' => $item->cat_color,
                ];
            } else {
                $item->category = null;
            }
            // Clean up flat fields
            unset($item->cat_id, $item->cat_name, $item->cat_icon, $item->cat_color);
            return $item;
        });

        return $transactions;
    }
}
