<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class PasswordResetEmailRequest extends FormRequest
{
    public function rules()
    {
        return [
            'email' => 'required|email|exists:users,email',
        ];
    }
    
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();
        $firstMessage = $errors->first(); // 最初のフィールドの最初のエラーを取る

        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => $firstMessage,
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
