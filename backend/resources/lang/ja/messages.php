<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Business Logic Messages
    |--------------------------------------------------------------------------
    |
    | ビジネスロジックエラーメッセージ（日本語）
    | バリデーション以外のエラーメッセージを定義
    |
    */

    // 認証関連
    'auth' => [
        'failed' => 'メールアドレスまたはパスワードが正しくありません',
        'password_mismatch' => 'パスワードが正しくありません',
        'throttle' => 'ログイン試行回数が多すぎます。:seconds秒後に再試行してください。',
        'unauthorized' => '認証が必要です',
        'forbidden' => '権限がありません',
        'admin_required' => '管理者権限が必要です',
        'logged_out' => 'ログアウトしました',
    ],

    // パスワードリセット
    'password_reset' => [
        'sent' => 'パスワードリセットメールを送信しました',
        'token_invalid' => 'トークンが無効です',
        'token_expired' => 'トークンの有効期限が切れています',
        'success' => 'パスワードをリセットしました',
        'email_subject' => '【会議室予約システム】パスワードリセット',
        'email_body' => 'パスワードリセットのリクエストを受け付けました。\n\n以下のリンクをクリックして、新しいパスワードを設定してください。\n\n:url\n\nこのリンクは30分間有効です。',
        'email_not_found' => 'このメールアドレスは登録されていません',  // ✅ 追加
        'email_send_failed' => 'メール送信に失敗しました',  // ✅ 追加
        'email_required' => 'メールアドレスを入力してください',  // ✅ 追加
        'email_invalid_format' => 'メールアドレスの形式が正しくありません',  // ✅ 追加

    ],

    // ユーザー管理
    'user' => [
        'created' => 'ユーザー登録が完了しました',
        'updated' => '情報を更新しました',
        'deleted' => 'アカウントを削除しました',
        'not_found' => 'ユーザーが見つかりません',
        'cannot_delete_admin' => '管理者アカウントは削除できません',
        'cannot_delete_self' => '自分自身は削除できません',
        'cannot_change_own_role' => '自分自身の権限は変更できません',
        'last_admin' => '最後の管理者です。管理者は最低1人必要です。',
    ],

    // 予約関連
    'event' => [
        'created' => '予約を作成しました',
        'updated' => '予約を更新しました',
        'deleted' => '予約をキャンセルしました',
        'not_found' => '予約が見つかりません',
        'time_conflict' => 'この時間帯は既に予約されています',
        'invalid_time_unit' => '予約時間は15分単位で指定してください',
        'past_time' => '過去の時間は予約できません',
        'creation_failed' => '予約の作成に失敗しました',
        'update_failed' => '予約の更新に失敗しました',
    ],

    // 部屋管理
    'room' => [
        'created' => '部屋を追加しました',
        'updated' => '部屋を更新しました',
        'deleted' => '部屋を削除しました',
        'not_found' => '部屋が見つかりません',
        'has_reservations' => '予約がある部屋は削除できません',
    ],

    // 通知
    'notification' => [
        'email_sent' => 'メール通知を送信しました',
        'email_failed' => 'メール送信に失敗しました',
    ],

    // 設定
    'settings' => [
        'updated' => '設定を更新しました',
        'language_changed' => '言語を変更しました',
    ],

    // 権限変更
    'role' => [
        'changed' => '権限を変更しました',
    ],

    // 一般
    'success' => '成功しました',
    'error' => 'エラーが発生しました',
    'validation_error' => 'バリデーションエラー',
    'server_error' => 'サーバーエラーが発生しました',
    'branch_not_found' => '拠点が見つかりません',
    'time_conversion_error' => '時刻の変換に失敗しました',
    'password_changed' => 'パスワードを変更しました',

];