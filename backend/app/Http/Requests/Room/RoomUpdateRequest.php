<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RoomUpdateRequest extends FormRequest
{
    /**
     * admin権限が必要
     */
    public function authorize()
    {
        return auth()->check() && auth()->user()->role === 'admin';
    }

    /**
     * バリデーションルール
     */
    public function rules()
    {
        return [
            'room_name' => 'required|string|max:20',
            'capacity' => 'required|integer|min:0',
            'facility' => 'nullable|string|max:150',
        ];
    }

    /**
     * 権限エラー時のレスポンス
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => __('messages.auth.admin_required')
            ], 403)
        );
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