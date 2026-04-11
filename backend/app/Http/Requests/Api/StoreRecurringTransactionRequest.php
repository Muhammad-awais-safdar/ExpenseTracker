<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) {
                    if ($value && !$this->user()->categories()->where('id', $value)->exists()) {
                        $fail('The selected category is invalid.');
                    }
                },
            ],
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:expense,income',
            'frequency' => 'required|in:daily,weekly,monthly,yearly',
            'description' => 'nullable|string|max:500',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ];
    }
}
