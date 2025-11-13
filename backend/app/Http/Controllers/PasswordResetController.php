<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * パスワードリセットメール送信
     */
    public function sendResetEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'このメールアドレスは登録されていません'
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

        // メール送信
        $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        Mail::raw(
            "パスワードリセットのリクエストを受け付けました。\n\n以下のリンクをクリックして、新しいパスワードを設定してください。\n\n{$resetUrl}\n\nこのリンクは30分間有効です。",
            function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('【会議室予約システム】パスワードリセット');
            }
        );

        return response()->json([
            'success' => true,
            'message' => 'パスワードリセットメールを送信しました',
            // 'reset_url' => $resetUrl, // 開発用（本番では削除）
        ]);
    }

    /**
     * パスワードリセット実行
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
                'message' => '無効なトークンです'
            ], 400);
        }

        // トークンの有効期限確認（30分）
        $createdAt = new \DateTime($resetRecord->created_at);
        $now = new \DateTime();
        $diff = $now->getTimestamp() - $createdAt->getTimestamp();

        if ($diff > 1800) { // 30分 = 1800秒
            return response()->json([
                'success' => false,
                'message' => 'トークンの有効期限が切れています'
            ], 400);
        }

        // トークン検証
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => '無効なトークンです'
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
            'message' => 'パスワードをリセットしました'
        ]);
    }
}