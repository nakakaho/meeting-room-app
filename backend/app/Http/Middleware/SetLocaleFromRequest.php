<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocaleFromRequest
{
    /**
     * リクエストヘッダーから言語を設定
     */
    public function handle(Request $request, Closure $next)
    {
        // ✅ Accept-Language ヘッダーから言語取得
        $locale = $request->header('Accept-Language', config('app.locale'));
        
        // サポートされている言語かチェック
        $supportedLocales = ['ja', 'en'];
        if (in_array($locale, $supportedLocales)) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}