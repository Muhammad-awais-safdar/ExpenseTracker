<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\Api\StoreCategoryRequest;
use App\Http\Requests\Api\UpdateCategoryRequest;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $categories = $user->categories()->get();

        // Auto-seed if empty to ensure a good first-run experience
        if ($categories->isEmpty()) {
            $this->seed($request);
            $categories = $user->categories()->get();
        }

        return response()->json($categories->values()->all());
    }

    public function seed(Request $request)
    {
        $user = $request->user();
        
        $defaults = [
            ['name' => 'Food', 'type' => 'expense', 'icon' => 'fast-food', 'color' => '#FF5733'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bus', 'color' => '#33FF57'],
            ['name' => 'Utilities', 'type' => 'expense', 'icon' => 'flash', 'color' => '#3357FF'],
            ['name' => 'Rent', 'type' => 'expense', 'icon' => 'home', 'color' => '#F3FF33'],
            ['name' => 'Health', 'type' => 'expense', 'icon' => 'medkit', 'color' => '#FF33F3'],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => 'cart', 'color' => '#25b917'],
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'cash', 'color' => '#33FFF3'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'laptop', 'color' => '#33FF33'],
            ['name' => 'Gift', 'type' => 'income', 'icon' => 'gift', 'color' => '#FF3333'],
            ['name' => 'Other', 'type' => 'expense', 'icon' => 'options', 'color' => '#6B7280'],
            ['name' => 'Other', 'type' => 'income', 'icon' => 'options', 'color' => '#6B7280'],
        ];

        foreach ($defaults as $cat) {
            $user->categories()->updateOrCreate(
                ['name' => $cat['name'], 'type' => $cat['type']],
                $cat
            );
        }

        return response()->json($user->categories()->get()->values()->all());
    }

    public function store(StoreCategoryRequest $request)
    {
        $category = $request->user()->categories()->create($request->validated());

        return response()->json($category, 201);
    }

    public function show(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }
        return $category;
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $category->update($request->validated());

        return $category;
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'The requested resource was not found or is unauthorized.'], 404);
        }

        $category->delete();

        return response()->noContent();
    }
}
