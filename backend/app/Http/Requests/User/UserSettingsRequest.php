<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserSettingsRequest extends FormRequest
{
    /**
     * 本人のみ（Controllerで権限チェック）
     */
    public function authorize()
    {
        return true;
    }

    /**
     * バリデーションルール
     */
    public function rules()
    {
        return [
            'lang' => 'nullable|in:en,jp',
            'notify_email' => 'nullable|boolean',
            'notify_my_schedule' => 'nullable|boolean',
            'notify_all_schedule' => 'nullable|boolean',
        ];
    }

    /**
     * バリデーション失敗時のレスポンス
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => __('messages.validation_error'),
                'errors' => $validator->errors()
            ], 422)
        );
    }
}