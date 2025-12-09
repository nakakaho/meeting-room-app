<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use App\Models\Event;
use Carbon\Carbon;

class DeleteOldReservationsCommand extends Command
{
    /**
     * コマンド名
     *
     * @var string
     */
    protected $signature = 'reservations:delete-old';

    /**
     * コマンドの説明
     *
     * @var string
     */
    protected $description = '1ヶ月以上前の予約を自動削除';

    /**
     * コマンド実行
     *
     * @return int
     */
    public function handle()
    {
        $this->info('古い予約の削除を開始します...');

        $oneMonthAgo = Carbon::now()->subMonth();
        $oldEvents = Event::where('end_time', '<', $oneMonthAgo)->get();
        $count = $oldEvents->count();

        if ($count === 0) {
            $this->info('削除対象の予約はありませんでした。');
            Log::channel('delete_old_reservations')->info('削除対象なし');
            return Command::SUCCESS;
        }

        foreach ($oldEvents as $event) {

            // コンソール出力
            $this->line("削除: ID={$event->event_id}, 日時={$event->start_time} - {$event->end_time}, 部屋={$event->room->room_name}");

            // 🔥 ログ出力（ここ追加）
            Log::channel('delete_old_reservations')->info('削除', [
                'id' => $event->event_id,
                'start' => $event->start_time,
                'end' => $event->end_time,
                'room' => $event->room->room_name,
            ]);

            $event->delete();
        }

        Log::channel('delete_old_reservations')->info("削除完了: {$count}件");
        $this->info("削除完了: {$count}件の予約を削除しました。");

        return Command::SUCCESS;
    }
}