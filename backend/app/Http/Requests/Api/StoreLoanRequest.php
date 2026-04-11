<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'person_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:given,taken',
            'due_date' => 'nullable|date',
            'status' => 'in:pending,paid',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
