<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | バリデーションエラーメッセージ（日本語）
    | :attribute, :value, :min, :max などのプレースホルダーが使用可能
    |
    */

    'accepted' => ':attributeを承認してください。',
    'accepted_if' => ':otherが:valueの場合、:attributeを承認してください。',
    'active_url' => ':attributeは有効なURLではありません。',
    'after' => ':attributeは:date以降の日付を指定してください。',
    'after_or_equal' => ':attributeは:date以降の日付を指定してください。',
    'alpha' => ':attributeは文字のみ使用できます。',
    'alpha_dash' => ':attributeは英数字とダッシュ(-)及び下線(_)がご利用できます。',
    'alpha_num' => ':attributeは英数字のみ使用できます。',
    'array' => ':attributeは配列でなければなりません。',
    'ascii' => ':attributeは半角英数字と記号のみ使用できます。',
    'before' => ':attributeは:date以前の日付を指定してください。',
    'before_or_equal' => ':attributeは:date以前の日付を指定してください。',
    'between' => [
        'array' => ':attributeは:min個から:max個の間で指定してください。',
        'file' => ':attributeは:min KBから:max KBの間で指定してください。',
        'numeric' => ':attributeは:minから:maxの間で指定してください。',
        'string' => ':attributeは:min文字から:max文字の間で指定してください。',
    ],
    'boolean' => ':attributeはtrueかfalseを指定してください。',
    'can' => ':attributeに許可されていない値が含まれています。',
    'confirmed' => ':attributeと確認用:attributeが一致しません。',
    'current_password' => 'パスワードが正しくありません。',
    'date' => ':attributeは有効な日付ではありません。',
    'date_equals' => ':attributeは:dateに等しい日付を指定してください。',
    'date_format' => ':attributeの形式が正しくありません。',
    'decimal' => ':attributeは小数点以下:decimal桁で指定してください。',
    'declined' => ':attributeを拒否してください。',
    'declined_if' => ':otherが:valueの場合、:attributeを拒否してください。',
    'different' => ':attributeと:otherには異なる値を指定してください。',
    'digits' => ':attributeは:digits桁で指定してください。',
    'digits_between' => ':attributeは:min桁から:max桁の間で指定してください。',
    'dimensions' => ':attributeの画像サイズが不正です。',
    'distinct' => ':attributeに重複した値があります。',
    'doesnt_end_with' => ':attributeは次のいずれかで終わってはいけません: :values',
    'doesnt_start_with' => ':attributeは次のいずれかで始まってはいけません: :values',
    'email' => ':attributeの形式が正しくありません。',
    'ends_with' => ':attributeは次のいずれかで終わらなければなりません: :values',
    'enum' => '選択された:attributeは正しくありません。',
    'exists' => '選択された:attributeは正しくありません。',
    'extensions' => ':attributeは次の拡張子のファイルでなければなりません: :values',
    'file' => ':attributeはファイルでなければなりません。',
    'filled' => ':attributeは必須です。',
    'gt' => [
        'array' => ':attributeは:value個より多く指定してください。',
        'file' => ':attributeは:value KBより大きくなければなりません。',
        'numeric' => ':attributeは:valueより大きくなければなりません。',
        'string' => ':attributeは:value文字より多くなければなりません。',
    ],
    'gte' => [
        'array' => ':attributeは:value個以上指定してください。',
        'file' => ':attributeは:value KB以上でなければなりません。',
        'numeric' => ':attributeは:value以上でなければなりません。',
        'string' => ':attributeは:value文字以上でなければなりません。',
    ],
    'hex_color' => ':attributeは有効な16進数カラーコードでなければなりません。',
    'image' => ':attributeは画像でなければなりません。',
    'in' => '選択された:attributeは正しくありません。',
    'in_array' => ':attributeは:otherに存在しません。',
    'integer' => ':attributeは整数で指定してください。',
    'ip' => ':attributeは有効なIPアドレスでなければなりません。',
    'ipv4' => ':attributeは有効なIPv4アドレスでなければなりません。',
    'ipv6' => ':attributeは有効なIPv6アドレスでなければなりません。',
    'json' => ':attributeは有効なJSON文字列でなければなりません。',
    'lowercase' => ':attributeは小文字でなければなりません。',
    'lt' => [
        'array' => ':attributeは:value個より少なく指定してください。',
        'file' => ':attributeは:value KBより小さくなければなりません。',
        'numeric' => ':attributeは:valueより小さくなければなりません。',
        'string' => ':attributeは:value文字より少なくなければなりません。',
    ],
    'lte' => [
        'array' => ':attributeは:value個以下にしてください。',
        'file' => ':attributeは:value KB以下でなければなりません。',
        'numeric' => ':attributeは:value以下でなければなりません。',
        'string' => ':attributeは:value文字以下でなければなりません。',
    ],
    'mac_address' => ':attributeは有効なMACアドレスでなければなりません。',
    'max' => [
        'array' => ':attributeは:max個以下にしてください。',
        'file' => ':attributeは:max KB以下でなければなりません。',
        'numeric' => ':attributeは:max以下で指定してください。',
        'string' => ':attributeは:max文字以内で入力してください。',
    ],
    'max_digits' => ':attributeは:max桁以下で指定してください。',
    'mimes' => ':attributeは次のファイルタイプでなければなりません: :values',
    'mimetypes' => ':attributeは次のファイルタイプでなければなりません: :values',
    'min' => [
        'array' => ':attributeは:min個以上指定してください。',
        'file' => ':attributeは:min KB以上でなければなりません。',
        'numeric' => ':attributeは:min以上で指定してください。',
        'string' => ':attributeは:min文字以上で入力してください。',
    ],
    'min_digits' => ':attributeは:min桁以上で指定してください。',
    'missing' => ':attributeを含めることはできません。',
    'missing_if' => ':otherが:valueの場合、:attributeを含めることはできません。',
    'missing_unless' => ':otherが:valueでない限り、:attributeを含めることはできません。',
    'missing_with' => ':valuesが存在する場合、:attributeを含めることはできません。',
    'missing_with_all' => ':valuesが存在する場合、:attributeを含めることはできません。',
    'multiple_of' => ':attributeは:valueの倍数でなければなりません。',
    'not_in' => '選択された:attributeは正しくありません。',
    'not_regex' => ':attributeの形式が正しくありません。',
    'numeric' => ':attributeは数値で指定してください。',
    'password' => [
        'letters' => ':attributeは文字を含める必要があります。',
        'mixed' => ':attributeは大文字と小文字を含める必要があります。',
        'numbers' => ':attributeは数字を含める必要があります。',
        'symbols' => ':attributeは記号を含める必要があります。',
        'uncompromised' => ':attributeは漏洩した可能性があります。別の:attributeを選択してください。',
    ],
    'present' => ':attributeが存在している必要があります。',
    'present_if' => ':otherが:valueの場合、:attributeが存在している必要があります。',
    'present_unless' => ':otherが:valueでない限り、:attributeが存在している必要があります。',
    'present_with' => ':valuesが存在する場合、:attributeが存在している必要があります。',
    'present_with_all' => ':valuesが存在する場合、:attributeが存在している必要があります。',
    'prohibited' => ':attributeは禁止されています。',
    'prohibited_if' => ':otherが:valueの場合、:attributeは禁止されています。',
    'prohibited_unless' => ':otherが:valuesでない限り、:attributeは禁止されています。',
    'prohibits' => ':attributeが存在する場合、:otherは禁止されています。',
    'regex' => ':attributeの形式が正しくありません。',
    'required' => ':attributeを入力してください。',
    'required_array_keys' => ':attributeには次のエントリが含まれている必要があります: :values',
    'required_if' => ':otherが:valueの場合、:attributeを入力してください。',
    'required_if_accepted' => ':otherが承認された場合、:attributeを入力してください。',
    'required_unless' => ':otherが:valuesでない限り、:attributeを入力してください。',
    'required_with' => ':valuesが存在する場合、:attributeを入力してください。',
    'required_with_all' => ':valuesが存在する場合、:attributeを入力してください。',
    'required_without' => ':valuesが存在しない場合、:attributeを入力してください。',
    'required_without_all' => ':valuesが存在しない場合、:attributeを入力してください。',
    'same' => ':attributeと:otherが一致しません。',
    'size' => [
        'array' => ':attributeは:size個指定してください。',
        'file' => ':attributeは:size KBでなければなりません。',
        'numeric' => ':attributeは:sizeでなければなりません。',
        'string' => ':attributeは:size文字にしてください。',
    ],
    'starts_with' => ':attributeは次のいずれかで始まる必要があります: :values',
    'string' => ':attributeは文字列で指定してください。',
    'timezone' => ':attributeは有効なタイムゾーンでなければなりません。',
    'unique' => 'この:attributeは既に使用されています。',
    'uploaded' => ':attributeのアップロードに失敗しました。',
    'uppercase' => ':attributeは大文字でなければなりません。',
    'url' => ':attributeは有効なURLでなければなりません。',
    'ulid' => ':attributeは有効なULIDでなければなりません。',
    'uuid' => ':attributeは有効なUUIDでなければなりません。',
    'email_not_found' => 'このメールアドレスは登録されていません',
    'token_invalid' => '無効なトークンです',
    'token_expired' => 'トークンの有効期限が切れています',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | カスタムバリデーションメッセージ
    |
    */

    'custom' => [
        'email' => [
            'exists' => 'このメールアドレスは登録されていません',
        ],
        'password' => [
            'regex' => 'パスワードは英数字を含める必要があります',
        ],
        'attendees.*' => [
            'exists' => '存在しない参加者が含まれています',
            'distinct' => '同じ参加者が重複しています',
            'integer' => '参加者の形式が不正です',
        ],
        'start_time' => [
            'date_format' => '開始時刻の形式が正しくありません',
        ],
        'end_time' => [
            'date_format' => '終了時刻の形式が正しくありません',
            'after' => '終了時刻は開始時刻より後にしてください',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | 属性の日本語名
    |
    */

    'attributes' => [
        // ユーザー関連
        'name' => '名前',
        'email' => 'メールアドレス',
        'password' => 'パスワード',
        'current_password' => '現在のパスワード',
        'new_password' => '新しいパスワード',
        'confirm_password' => '確認用パスワード',
        'password_confirmation' => '確認用パスワード',
        'token' => 'トークン',
        'role' => 'ロール',
        'lang' => '言語',
        
        // 通知設定
        'notify_email' => '予約完了メール',
        'notify_my_schedule' => 'マイスケジュール通知',
        'notify_all_schedule' => '全室利用状況通知',
        
        // 拠点・部屋
        'branch_id' => '拠点',
        'room_id' => '会議室',
        'room_name' => '部屋名',
        'capacity' => '定員',
        'facility' => '設備情報',
        
        // 予約
        'event_id' => '予約ID',
        'start_time' => '開始時間',
        'end_time' => '終了時間',
        'attendees' => '参加者',
        'memo' => 'メモ',
    ],

];