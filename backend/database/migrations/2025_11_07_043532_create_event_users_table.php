<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_users', function (Blueprint $table) {
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at')->useCurrent();

            // 複合主キー
            $table->primary(['event_id', 'user_id']);

            // 外部キー制約
            $table->foreign('event_id')->references('event_id')->on('events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // インデックス
            $table->index('user_id', 'idx_event_users_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_users');
    }
};