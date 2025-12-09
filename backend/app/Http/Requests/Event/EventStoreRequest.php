<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class EventStoreRequest extends FormRequest
{
    /**
     * 認証ユーザーのみ
     */
    public function authorize()
    {
        return auth()->check();
    }

    /**
     * バリデーションルール
     */
    public function rules()
    {
        return [
            'branch_id' => 'required|exists:branches,branch_id',
            'room_id' => 'required|exists:rooms,room_id',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'attendees' => 'nullable|array',
            'attendees.*' => 'integer|exists:users,id|distinct',
            'memo' => 'nullable|string|max:150',
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