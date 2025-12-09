<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * アプリケーションのArtisanコマンド
     *
     * @var array
     */
    protected $commands = [
        Commands\DeleteOldReservationsCommand::class,
    ];

    protected $middlewareGroups = [
       'api' => [
           \App\Http\Middleware\SetLocale::class, // ← 追加した？
       ],
   ];
   
    /**
     * アプリケーションのコマンドスケジュール定義
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // ✅ 毎日午前3時に1ヶ月以上前の予約を削除
        $schedule->command('reservations:delete-old')
                 ->daily()
                 ->at('03:00')
                 ->timezone('Asia/Tokyo')
                 ->appendOutputTo(storage_path('logs/delete-old-reservations.log'));
    }

    /**
     * アプリケーションのコマンドをロード
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}