<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecurringTransactionRequest extends FormRequest
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
            'amount' => 'numeric|min:0.01',
            'type' => 'in:expense,income',
            'frequency' => 'in:daily,weekly,monthly,yearly',
            'description' => 'nullable|string|max:500',
            'start_date' => 'date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
        ];
    }
}
