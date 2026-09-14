<?php

namespace App\Console\Commands;

use App\Mail\DatabaseBackupMail;
use App\Support\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--keep : Keep the local backup file after sending (local/testing only)}';
    protected $description = 'Dump the full database to a compressed SQL file and email it to the admin';

    public function handle(): int
    {
        $database = config('database.connections.mysql.database');
        $this->info("Dumping database '{$database}'...");

        $sql = $this->dumpDatabase($database);

        $filename = 'maadin-backup-' . now()->format('Y-m-d_His') . '.sql.gz';
        $path = storage_path('app/' . $filename);
        file_put_contents($path, gzencode($sql, 9));

        $sizeKb = round(filesize($path) / 1024, 1);
        $this->info("Backup written: {$filename} ({$sizeKb} KB)");

        Mail::to(AdminNotifier::email())->send(new DatabaseBackupMail($path, $filename, $sizeKb));

        if (!app()->environment('local') || !$this->option('keep')) {
            unlink($path);
        }
        $this->info('Backup emailed and temp file cleaned up.');

        return self::SUCCESS;
    }

    private function dumpDatabase(string $database): string
    {
        $tables = collect(DB::select('SHOW TABLES'))
            ->map(fn($row) => array_values((array) $row)[0]);

        $sql = "-- Marrakech Maadine database backup\n";
        $sql .= "-- Generated: " . now()->toDateTimeString() . "\n";
        $sql .= "-- Database: {$database}\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            $this->line("  - {$table}");

            $createRow = DB::select("SHOW CREATE TABLE `{$table}`")[0];
            $createSql = $createRow->{'Create Table'};

            $sql .= "-- ----------------------------\n";
            $sql .= "-- Table: {$table}\n";
            $sql .= "-- ----------------------------\n";
            $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
            $sql .= $createSql . ";\n\n";

            $rows = DB::table($table)->get();
            if ($rows->isEmpty()) {
                continue;
            }

            $columns = array_keys((array) $rows->first());
            $columnList = implode('`, `', $columns);

            // Batch inserts, 200 rows at a time, to keep individual statements a sane size
            foreach ($rows->chunk(200) as $chunk) {
                $valueRows = $chunk->map(function ($row) use ($columns) {
                    $row = (array) $row;
                    $values = array_map(function ($value) {
                        if (is_null($value)) return 'NULL';
                        return DB::connection()->getPdo()->quote((string) $value);
                    }, array_values(array_intersect_key($row, array_flip($columns))));
                    return '(' . implode(', ', $values) . ')';
                })->implode(",\n");

                $sql .= "INSERT INTO `{$table}` (`{$columnList}`) VALUES\n{$valueRows};\n";
            }

            $sql .= "\n";
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $sql;
    }
}
