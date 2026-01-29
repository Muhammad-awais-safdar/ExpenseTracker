<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\RecurringTransaction;
use App\Models\Expense;
use App\Models\Income;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'recurring:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process recurring transactions that are due today';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        
        $dueTransactions = RecurringTransaction::where('is_active', true)
            ->whereDate('next_run_date', '<=', $today)
            ->get();
            
        $this->info("Found {$dueTransactions->count()} due transactions.");

        foreach ($dueTransactions as $recurring) {
            DB::transaction(function () use ($recurring) {
                // Create Transaction
                if ($recurring->type === 'expense') {
                    Expense::create([
                        'user_id' => $recurring->user_id,
                        'amount' => $recurring->amount,
                        'description' => $recurring->title . ' (Recurring)',
                        'date' => $recurring->next_run_date,
                        'category_id' => $recurring->category_id,
                    ]);
                } else {
                    Income::create([
                        'user_id' => $recurring->user_id,
                        'amount' => $recurring->amount,
                        'source' => $recurring->title . ' (Recurring)',
                        'date' => $recurring->next_run_date,
                        'category_id' => $recurring->category_id,
                    ]);
                }

                // Update Next Run Date
                $nextDate = Carbon::parse($recurring->next_run_date);
                switch ($recurring->frequency) {
                    case 'daily': $nextDate->addDay(); break;
                    case 'weekly': $nextDate->addWeek(); break;
                    case 'monthly': $nextDate->addMonth(); break;
                    case 'yearly': $nextDate->addYear(); break;
                }
                
                $recurring->update(['next_run_date' => $nextDate]);
            });
            
            $this->info("Processed: {$recurring->title}");
        }
    }
}
