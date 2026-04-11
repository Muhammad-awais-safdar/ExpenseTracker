<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ownership check is usually handled in the controller or a Policy, 
        // but we can ensure the user is authenticated here.
        return true;
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
            'amount' => 'numeric|min:0.01',
            'description' => 'nullable|string|max:500',
            'date' => 'date',
        ];
    }
}
