<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Services\TransactionRepository;

class ExportController extends Controller
{
    public function export(Request $request)
    {
        $user = $request->user();

        // Use Repository for Data Fetching
        $repository = new TransactionRepository();
        $query = $repository->getQuery($user, [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'category_id' => $request->input('category_id'),
            'search' => $request->input('search')
        ]);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');

            // Header Row
            fputcsv($file, ['ID', 'Date', 'Type', 'Category', 'Description/Source', 'Debit', 'Credit']);

            // Chunking for memory efficiency
            $query->chunk(100, function ($rows) use ($file) {
                foreach ($rows as $row) {
                    $debit = null;
                    $credit = null;

                    if ($row->type === 'expense') {
                        $debit = $row->amount;
                    } else {
                        $credit = $row->amount;
                    }

                    fputcsv($file, [
                        $row->id,
                        $row->date,
                        ucfirst($row->type),
                        $row->cat_name ?? 'N/A',
                        $row->title,
                        $debit,
                        $credit,
                    ]);
                }
            });

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
}
