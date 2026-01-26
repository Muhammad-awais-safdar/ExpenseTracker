<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->categories()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:expense,income',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category = $request->user()->categories()->create($validated);

        return response()->json($category, 201);
    }

    public function show(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }
        return $category;
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:expense,income',
            'icon' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $category->update($validated);

        return $category;
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $category->delete();

        return response()->noContent();
    }
}
