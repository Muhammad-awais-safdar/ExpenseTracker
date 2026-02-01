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
            $table->index('date');
        });
        
        Schema::table('incomes', function (Blueprint $table) {
            $table->index('date');
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['date']);
        });

        Schema::table('incomes', function (Blueprint $table) {
            $table->dropIndex(['date']);
        });

        Schema::table('loans', function (Blueprint $table) {
            $table->dropIndex(['due_date']);
        });
    }
};
