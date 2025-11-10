<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id('room_id');
            $table->unsignedBigInteger('branch_id');
            $table->string('room_name', 20);
            $table->unsignedTinyInteger('capacity')->default(0);
            $table->string('facility', 150)->nullable();
            $table->timestamp('created_at')->useCurrent(); // 追加
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate(); // 追加

            // 外部キー制約
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');

            // インデックス
            $table->index('branch_id', 'idx_rooms_branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};