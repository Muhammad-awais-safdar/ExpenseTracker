<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => [
                'exists:categories,id',
                function ($attribute, $value, $fail) {
                    if ($value && !$this->user()->categories()->where('id', $value)->exists()) {
                        $fail('The selected category is invalid.');
                    }
                },
            ],
            'amount' => 'numeric|min:0.01',
            'period' => 'in:monthly,yearly',
            'start_date' => 'date',
            'end_date' => 'date|after_or_equal:start_date',
        ];
    }
}
