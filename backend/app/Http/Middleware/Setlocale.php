<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        // 認証ユーザーの言語設定を使用
        if (auth()->check()) {
            $locale = auth()->user()->lang ?? 'en';
            App::setLocale($locale);
        }
        
        return $next($request);
    }
}
