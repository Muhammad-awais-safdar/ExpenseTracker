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
        Schema::create('saving_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0);
            $table->date('target_date')->nullable();
            $table->string('color')->nullable();
            $table->string('icon')->nullable();
            $table->string('status')->default('active'); // active, completed
            $table->timestamps();
        });

        Schema::create('saving_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saving_goal_id')->constrained('saving_goals')->onDelete('cascade');
            $table->string('type'); // deposit, withdraw
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_transactions');
        Schema::dropIfExists('saving_goals');
    }
};
