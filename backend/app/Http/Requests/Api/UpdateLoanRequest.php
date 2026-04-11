<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'person_name' => 'string|max:255',
            'amount' => 'numeric|min:0.01',
            'type' => 'in:given,taken',
            'due_date' => 'nullable|date',
            'status' => 'in:pending,paid',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
