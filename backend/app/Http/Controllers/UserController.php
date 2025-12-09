<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * ✅ 追加: 同じ拠点のユーザー一覧取得(参加者選択用)
     * 一般ユーザーも自分の拠点のユーザー一覧を取得可能
     */
    public function getBranchUsers(Request $request)
    {
        $user = auth()->user();
        $query = $request->query('query'); // ← 検索ワード（?query=山田）

        $users = User::where('branch_id', $user->branch_id)
                    // ->where('id', '!=', $user->id) // ← 自分を除外
                    ->when($query, function($q) use ($query) {
                        $q->where('name', 'like', "%{$query}%");
                    })
                    ->select('id', 'name', 'email', 'role')
                    ->orderBy('name', 'asc')
                    ->get();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * 自分の情報取得
     */
    public function show($id)
    {
        $user = auth()->user();

        // 本人またはadminのみ
        if ($user->id != $id && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'ユーザーが見つかりません'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'role' => $targetUser->role,
                'branch_id' => $targetUser->branch_id,
                'lang' => $targetUser->lang,
                'notify_email' => $targetUser->notify_email,
                'notify_my_schedule' => $targetUser->notify_my_schedule,
            ]
        ]);
    }

    /**
     * 情報更新
     */
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        // 本人のみ
        if ($user->id != $id) {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        // 変更された項目のみバリデーション
        $rules = [];
        if ($request->has('name')) {
            $rules['name'] = 'required|string|max:50';
        }
        if ($request->has('email')) {
            $rules['email'] = 'required|email|unique:users,email,' . $id;
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 変更された項目のみ更新
        $updates = [];
        if ($request->has('name')) {
            $updates['name'] = $request->name;
        }
        if ($request->has('email')) {
            $updates['email'] = $request->email;
        }

        if (!empty($updates)) {
            $user->update($updates);
        }

        return response()->json([
            'success' => true,
            'message' => '情報を更新しました'
        ]);
    }

    /**
     * 設定変更(通知・言語)
     */
    public function updateSettings(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->id != $id) {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'lang' => 'nullable|in:en,jp',
            'notify_email' => 'nullable|boolean',
            'notify_my_schedule' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'lang',
            'notify_email',
            'notify_my_schedule',
        ]));

        return response()->json([
            'success' => true,
            'message' => '設定を更新しました'
        ]);
    }

    /**
     * パスワード変更
     */
    public function changePassword(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->id != $id) {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|max:12',
            'confirm_password' => 'required|same:new_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 現在のパスワード確認
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => '現在のパスワードが正しくありません',
                'errors' => [
                    'current_password' => ['現在のパスワードが正しくありません']
                ]
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'パスワードを変更しました'
        ]);
    }

    /**
     * アカウント削除
     */
    public function destroy($id)
    {
        $user = auth()->user();

        if ($user->id != $id) {
            return response()->json([
                'success' => false,
                'message' => '権限がありません'
            ], 403);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => '管理者アカウントは削除できません'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'アカウントを削除しました'
        ]);
    }
}