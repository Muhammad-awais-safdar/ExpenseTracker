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
        $categories = $request->user()->categories()->get();
        return response()->json($categories->values()->all());
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
