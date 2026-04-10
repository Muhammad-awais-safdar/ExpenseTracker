<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Loan;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinanceApiTest extends TestCase
{
    use RefreshDatabase;

    private function authUser(): User
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        return $user;
    }

    public function test_expense_crud_works_for_authenticated_user(): void
    {
        $user = $this->authUser();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Food',
            'type' => 'expense',
            'icon' => 'fast-food-outline',
            'color' => '#EF4444',
        ]);

        $create = $this->postJson('/api/expenses', [
            'category_id' => $category->id,
            'amount' => 1200,
            'description' => 'Lunch',
            'date' => now()->toDateString(),
        ]);
        $create->assertCreated()->assertJsonPath('description', 'Lunch');

        $expenseId = $create->json('id');

        $this->getJson('/api/expenses')->assertOk()->assertJsonFragment(['description' => 'Lunch']);

        $this->putJson("/api/expenses/{$expenseId}", ['description' => 'Dinner'])
            ->assertOk()
            ->assertJsonPath('description', 'Dinner');

        $this->deleteJson("/api/expenses/{$expenseId}")->assertNoContent();
        $this->assertDatabaseMissing('expenses', ['id' => $expenseId]);
    }

    public function test_income_crud_works_for_authenticated_user(): void
    {
        $user = $this->authUser();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Salary',
            'type' => 'income',
            'icon' => 'wallet-outline',
            'color' => '#10B981',
        ]);

        $create = $this->postJson('/api/incomes', [
            'category_id' => $category->id,
            'amount' => 50000,
            'source' => 'Monthly Salary',
            'date' => now()->toDateString(),
        ]);
        $create->assertCreated()->assertJsonPath('source', 'Monthly Salary');

        $incomeId = $create->json('id');

        $this->getJson('/api/incomes')->assertOk()->assertJsonFragment(['source' => 'Monthly Salary']);

        $this->putJson("/api/incomes/{$incomeId}", ['source' => 'Bonus'])
            ->assertOk()
            ->assertJsonPath('source', 'Bonus');

        $this->deleteJson("/api/incomes/{$incomeId}")->assertNoContent();
        $this->assertDatabaseMissing('incomes', ['id' => $incomeId]);
    }

    public function test_loan_create_and_settle_creates_cashflow_side_effects(): void
    {
        $user = $this->authUser();

        $create = $this->postJson('/api/loans', [
            'person_name' => 'Ali',
            'amount' => 3000,
            'type' => 'given',
            'status' => 'pending',
            'due_date' => now()->addWeek()->toDateString(),
            'description' => 'Short term loan',
        ]);
        $create->assertCreated()->assertJsonPath('status', 'pending');

        $loanId = $create->json('id');
        $this->assertDatabaseHas('expenses', [
            'user_id' => $user->id,
            'description' => 'Loan Given: Ali',
        ]);

        $this->putJson("/api/loans/{$loanId}", ['status' => 'paid'])->assertOk();
        $this->assertDatabaseHas('incomes', [
            'user_id' => $user->id,
            'source' => 'Loan Repayment: Ali',
        ]);
    }

    public function test_budget_and_recurring_endpoints_work_for_authenticated_user(): void
    {
        $user = $this->authUser();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Utilities',
            'type' => 'expense',
            'icon' => 'flash-outline',
            'color' => '#3B82F6',
        ]);

        $budget = $this->postJson('/api/budgets', [
            'category_id' => $category->id,
            'amount' => 12000,
            'period' => 'monthly',
            'start_date' => now()->startOfMonth()->toDateString(),
            'end_date' => now()->endOfMonth()->toDateString(),
        ]);
        $budget->assertCreated();
        $budgetId = $budget->json('id');

        $this->getJson('/api/budgets')->assertOk();
        $this->deleteJson("/api/budgets/{$budgetId}")->assertNoContent();

        $recurring = $this->postJson('/api/recurring', [
            'type' => 'expense',
            'amount' => 2500,
            'title' => 'Internet Bill',
            'category_id' => $category->id,
            'frequency' => 'monthly',
            'start_date' => now()->addDay()->toDateString(),
        ]);
        $recurring->assertCreated()->assertJsonPath('title', 'Internet Bill');
        $recurringId = $recurring->json('id');

        $this->putJson("/api/recurring/{$recurringId}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('is_active', false);
        $this->deleteJson("/api/recurring/{$recurringId}")->assertOk();
    }

    public function test_dashboard_and_analytics_endpoints_return_success(): void
    {
        $user = $this->authUser();

        $expenseCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Food',
            'type' => 'expense',
            'icon' => 'restaurant-outline',
            'color' => '#EF4444',
        ]);

        $incomeCategory = Category::create([
            'user_id' => $user->id,
            'name' => 'Salary',
            'type' => 'income',
            'icon' => 'cash-outline',
            'color' => '#10B981',
        ]);

        Expense::create([
            'user_id' => $user->id,
            'category_id' => $expenseCategory->id,
            'amount' => 1000,
            'description' => 'Meal',
            'date' => now()->toDateString(),
        ]);

        Income::create([
            'user_id' => $user->id,
            'category_id' => $incomeCategory->id,
            'amount' => 5000,
            'source' => 'Salary',
            'date' => now()->toDateString(),
        ]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure(['summary', 'recent_transactions', 'trends', 'category_breakdown']);

        $this->getJson('/api/analytics?period=month')
            ->assertOk()
            ->assertJsonStructure(['summary', 'categories', 'chart_data', 'period', 'range']);
    }
}
