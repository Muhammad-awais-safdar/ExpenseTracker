<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'awais@gmail.com'],
            [
                'name' => 'Awais',
                'password' => Hash::make('password'),
            ]
        );

        $this->command->info('Seed completed.');
    $this->command->info('Login with:'. $user->email . ' /' . 'password');
        $categories = [
            // Expense
            ['name' => 'Food', 'type' => 'expense', 'icon' => 'food', 'color' => '#FF5733'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bus', 'color' => '#33FF57'],
            ['name' => 'Utilities', 'type' => 'expense', 'icon' => 'bolt', 'color' => '#3357FF'],
            ['name' => 'Entertainment', 'type' => 'expense', 'icon' => 'film', 'color' => '#F3FF33'],
            ['name' => 'Health', 'type' => 'expense', 'icon' => 'medkit', 'color' => '#FF33F3'],
            
            // Income
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'money', 'color' => '#33FFF3'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'laptop', 'color' => '#33FF33'],
            ['name' => 'Investments', 'type' => 'income', 'icon' => 'chart-line', 'color' => '#FF3333'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name'], 'user_id' => $user->id],
                $category
            );
        }
    }
}
