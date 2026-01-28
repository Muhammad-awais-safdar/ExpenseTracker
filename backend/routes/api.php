    <?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MobileAuthController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\TransactionController;

Route::post('/mobile/register', [MobileAuthController::class, 'register']);
Route::post('/mobile/login', [MobileAuthController::class, 'login']);

// Health Check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/mobile/logout', [MobileAuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('incomes', IncomeController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('loans', LoanController::class);
    Route::apiResource('budgets', BudgetController::class);
    Route::get('/transactions', [TransactionController::class, 'index']);
});
