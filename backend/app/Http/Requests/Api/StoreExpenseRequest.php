<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authentication is handled by Sanctum middleware
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $exists = $this->user()->categories()->where('id', $value)->exists();
                        if (!$exists) {
                            $fail('The selected category is invalid or does not belong to you.');
                        }
                    }
                },
            ],
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
            'date' => 'required|date',
        ];
    }
}
