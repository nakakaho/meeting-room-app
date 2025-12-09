<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\PasswordResetMail; // ✅ 追加
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * パスワードリセットメール送信（多言語対応）
     */
    public function sendResetEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            // ✅ カスタムエラーメッセージ
            'email.required' => __('messages.password_reset.email_required'),
            'email.email' => __('messages.password_reset.email_invalid_format'),
            'email.exists' => __('messages.password_reset.email_not_found'),
        ]);

        if ($validator->fails()) {
            // ✅ 最初のエラーメッセージを返す
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first('email')
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // トークン生成
        $token = Str::random(60);

        // 既存のトークンを削除して新規作成
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // ✅ リセットURL生成
        $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        // ✅ ユーザーの言語設定に応じてメール送信
        $locale = $user->lang === 'en' ? 'en' : 'ja';

        try {
            Mail::to($request->email)
                ->locale($locale) // ✅ 言語指定
                ->send(new PasswordResetMail($resetUrl, $locale));
        } catch (\Exception $e) {
            \Log::error('Password reset email error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => __('messages.password_reset.email_send_failed')
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => __('messages.password_reset.sent'),
        ]);
    }

    /**
     * パスワードリセット実行（多言語対応）
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'new_password' => 'required|string|min:8|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // トークンを確認
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => __('messages.password_reset.token_invalid')
            ], 400);
        }

        // トークンの有効期限確認（30分）
        $createdAt = new \DateTime($resetRecord->created_at);
        $now = new \DateTime();
        $diff = $now->getTimestamp() - $createdAt->getTimestamp();

        if ($diff > 1800) { // 30分 = 1800秒
            return response()->json([
                'success' => false,
                'message' => __('messages.password_reset.token_expired')
            ], 400);
        }

        // トークン検証
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => __('messages.password_reset.token_invalid')
            ], 400);
        }

        // パスワード更新
        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        // トークン削除
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.password_reset.success')
        ]);
    }
}