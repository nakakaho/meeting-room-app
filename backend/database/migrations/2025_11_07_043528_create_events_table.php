<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('organizer_id');
            $table->unsignedBigInteger('room_id');
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('memo', 150)->nullable();
            $table->timestamp('created_at')->useCurrent(); // 追加
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate(); // 追加

            // 外部キー制約
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
            $table->foreign('organizer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');

            // インデックス
            $table->index(['branch_id', 'start_time'], 'idx_events_branch_start');
            $table->index(['room_id', 'start_time', 'end_time'], 'idx_events_room_time');
            $table->index('organizer_id', 'idx_events_organizer');
            $table->index('start_time', 'idx_events_start_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};