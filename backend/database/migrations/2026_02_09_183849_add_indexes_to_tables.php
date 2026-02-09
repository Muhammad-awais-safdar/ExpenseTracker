<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category_id']);
        });

        Schema::table('incomes', function (Blueprint $table) {
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category_id']);
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->index(['user_id', 'type', 'status']);
            $table->index(['user_id', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['user_id', 'category_id']);
        });

        Schema::table('incomes', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'date']);
            $table->dropIndex(['user_id', 'category_id']);
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'type', 'status']);
            $table->dropIndex(['user_id', 'due_date']);
        });
    }
};
