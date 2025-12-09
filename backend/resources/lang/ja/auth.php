<?php

return [
    // ... 既存の内容

    // ✅ 追加
    'password_reset_subject' => '【会議室予約システム】パスワードリセット',
    'password_reset_email_body' => "パスワードリセットのリクエストを受け付けました。\n\n以下のリンクをクリックして、新しいパスワードを設定してください。\n\n:url\n\nこのリンクは30分間有効です。",
    'reset_email_sent' => 'パスワードリセットメールを送信しました',
    'password_reset_success' => 'パスワードをリセットしました',
];