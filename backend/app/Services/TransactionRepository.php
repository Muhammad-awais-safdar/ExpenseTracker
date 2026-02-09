<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class TransactionRepository
{
    /**
     * Get the query builder for transactions (Expenses + Incomes)
     * 
     * @param User $user
     * @param array $filters ['start_date', 'end_date', 'category_id', 'search']
     * @return \Illuminate\Database\Query\Builder
     */
    public function getQuery(User $user, array $filters = [])
    {
        $startDate = $filters['start_date'] ?? null;
        $endDate = $filters['end_date'] ?? null;
        $categoryId = $filters['category_id'] ?? null;
        $search = $filters['search'] ?? null;

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

        if ($startDate) $expenses->where('expenses.date', '>=', $startDate);
        if ($endDate) $expenses->where('expenses.date', '<=', $endDate);
        if ($categoryId) $expenses->where('expenses.category_id', $categoryId);
        if ($search) $expenses->where('expenses.description', 'like', "%{$search}%");

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

        if ($startDate) $incomes->where('incomes.date', '>=', $startDate);
        if ($endDate) $incomes->where('incomes.date', '<=', $endDate);
        if ($categoryId) $incomes->where('incomes.category_id', $categoryId);
        if ($search) $incomes->where('incomes.source', 'like', "%{$search}%");

        // Combine
        $query = $expenses->union($incomes);
        
        $query->orderBy('date', 'desc')
              ->orderBy('created_at', 'desc');

        return $query;
    }
}
