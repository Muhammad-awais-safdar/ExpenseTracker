<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;

class TransactionController extends Controller
{
    // ... index method ...

    public function destroy(Request $request, $id)
    {
        $type = $request->input('type'); // 'expense', 'income', 'loan', 'loan_given', 'loan_taken'
        
        if (!$type) {
            return response()->json(['message' => 'Type is required'], 400);
        }

        $user = $request->user();
        
        switch ($type) {
            case 'expense':
                $record = Expense::where('id', $id)->where('user_id', $user->id)->firstOrFail();
                break;
            case 'income':
                $record = Income::where('id', $id)->where('user_id', $user->id)->firstOrFail();
                break;
            case 'loan':
            case 'loan_given':
            case 'loan_taken':
                $record = Loan::where('id', $id)->where('user_id', $user->id)->firstOrFail();
                break;
            default:
                return response()->json(['message' => 'Invalid type'], 400);
        }

        $record->delete();

        return response()->noContent();
    }


    public function index(Request $request)
    {
        $user = $request->user();

        // Filters
        $search = $request->input('search');
        $categoryId = $request->input('category_id');
        $startDate = $request->input('start_date'); // YYYY-MM-DD
        $endDate = $request->input('end_date');     // YYYY-MM-DD

        // Base Filter Closure
        $applyFilters = function($q) use ($search, $categoryId, $startDate, $endDate, $user) {
            $q->where('user_id', $user->id);
            if ($startDate) $q->where('date', '>=', $startDate);
            if ($endDate) $q->where('date', '<=', $endDate);
            if ($categoryId) {
                 // Note: Loans don't have categories in this simple model, so strict category filter excludes loans
                 // unless we decide loans have a 'category_id' which is currently null
                 if(method_exists($q->getModel(), 'getTable') && $q->getModel()->getTable() === 'loans') {
                    // loans table
                    $q->whereRaw('1 = 0'); // Exclude loans if category filter is active
                 } else {
                     $q->where('category_id', $categoryId);
                 }
            }
            if ($search) {
                 // check table to determine column names
                 // This closure is applied to query builder instance
                 // Actually DB::table returns builder.
            }
        };
        
        // Re-writing queries to apply filters cleanly
        
        // Expenses
        $expenses = DB::table('expenses')
            ->where('expenses.user_id', $user->id)
            ->leftJoin('categories', 'expenses.category_id', '=', 'categories.id')
            ->select('expenses.id', 'expenses.amount', 'expenses.date', 'expenses.created_at', DB::raw("'expense' as type"), 'expenses.description as title', 'categories.id as cat_id', 'categories.name as cat_name', 'categories.icon as cat_icon', 'categories.color as cat_color');
            
        if ($startDate) $expenses->where('expenses.date', '>=', $startDate);
        if ($endDate) $expenses->where('expenses.date', '<=', $endDate);
        if ($categoryId) $expenses->where('expenses.category_id', $categoryId);
        if ($search) $expenses->where('expenses.description', 'like', "%{$search}%");

        // Incomes
        $incomes = DB::table('incomes')
            ->where('incomes.user_id', $user->id)
            ->leftJoin('categories', 'incomes.category_id', '=', 'categories.id')
            ->select('incomes.id', 'incomes.amount', 'incomes.date', 'incomes.created_at', DB::raw("'income' as type"), 'incomes.source as title', 'categories.id as cat_id', 'categories.name as cat_name', 'categories.icon as cat_icon', 'categories.color as cat_color');

        if ($startDate) $incomes->where('incomes.date', '>=', $startDate);
        if ($endDate) $incomes->where('incomes.date', '<=', $endDate);
        if ($categoryId) $incomes->where('incomes.category_id', $categoryId);
        if ($search) $incomes->where('incomes.source', 'like', "%{$search}%");

        // Loans (Only include if no category filter, or we could map loans to a "Loan" category if visual only)
        // For now, if category_id is set, we skip loans as they have no category.
        $loans = DB::table('loans')
            ->where('loans.user_id', $user->id)
            ->select('loans.id', 'loans.amount', 'loans.due_date as date', 'loans.created_at', DB::raw("CASE WHEN type = 'given' THEN 'loan_given' ELSE 'loan_taken' END as type"), 'loans.person_name as title', DB::raw("NULL as cat_id"), DB::raw("NULL as cat_name"), DB::raw("NULL as cat_icon"), DB::raw("NULL as cat_color"));

        if ($startDate) $loans->where('loans.due_date', '>=', $startDate);
        if ($endDate) $loans->where('loans.due_date', '<=', $endDate);
        if ($search) $loans->where('loans.person_name', 'like', "%{$search}%");
        
        $query = $expenses->union($incomes);
        
        if (!$categoryId) {
            $query = $query->union($loans);
        }
        
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
