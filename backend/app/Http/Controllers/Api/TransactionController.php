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


        
        // Use Repository
        $repository = new \App\Services\TransactionRepository();
        $query = $repository->getQuery($user, [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'category_id' => $categoryId,
            'search' => $search
        ]);
        
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
