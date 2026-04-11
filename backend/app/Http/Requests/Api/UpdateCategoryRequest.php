<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'string|max:255',
            'type' => 'in:expense,income',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
        ];
    }
}
