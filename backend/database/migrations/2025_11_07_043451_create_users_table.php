<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('branch_id');
            $table->string('name', 50);
            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->string('lang', 2)->default('en');
            $table->boolean('notify_email')->default(true);
            $table->boolean('notify_my_schedule')->default(true);
            $table->boolean('notify_all_schedule')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // 外部キー制約
            $table->foreign('branch_id')->references('branch_id')->on('branches')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};