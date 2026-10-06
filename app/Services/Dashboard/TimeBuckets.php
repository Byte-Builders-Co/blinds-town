<?php

namespace App\Services\Dashboard;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Splits a date range into chart buckets (days, weeks or months) and
 * maps database group keys onto them, so every bucket exists in the chart
 * even when nothing happened in it.
 */
final class TimeBuckets
{
    /** @var list<array{start: CarbonImmutable, end: CarbonImmutable}> */
    private array $slots = [];

    private readonly bool $spansYears;

    public function __construct(
        private readonly CarbonImmutable $from,
        private readonly CarbonImmutable $to,
        public readonly Granularity $granularity,
    ) {
        $this->spansYears = $from->year !== $to->year;
        $this->slots = $this->buildSlots();
    }

    public function count(): int
    {
        return count($this->slots);
    }

    /**
     * Short x-axis label for a bucket.
     */
    public function label(int $index): string
    {
        $start = $this->slots[$index]['start'];

        return match ($this->granularity) {
            Granularity::Day, Granularity::Week => $start->format('M j'),
            // Across years, only the first month and each January carry the year.
            Granularity::Month => $this->spansYears && ($index === 0 || $start->month === 1) ? $start->format("M 'y") : $start->format('M'),
        };
    }

    /**
     * Full description of a bucket, shown in the tooltip.
     */
    public function title(int $index): string
    {
        ['start' => $start, 'end' => $end] = $this->slots[$index];

        return match ($this->granularity) {
            Granularity::Day => $start->format('D, M j, Y'),
            Granularity::Week => $start->year === $end->year
                ? $start->format('M j').' – '.$end->format('M j, Y')
                : $start->format('M j, Y').' – '.$end->format('M j, Y'),
            Granularity::Month => $start->format('F Y'),
        };
    }

    /**
     * SQL expression that groups a timestamp column by calendar day. Weeks and months
     * are rolled up from days in PHP so one query serves every range.
     */
    public function groupExpression(string $column): string
    {
        $connection = DB::connection();
        $wrapped = $connection->getQueryGrammar()->wrap($column);
        $driver = $connection->getDriverName();

        return $driver === 'sqlsrv' ? "CAST({$wrapped} AS date)" : "DATE({$wrapped})";
    }

    /**
     * The bucket a {@see groupExpression()} key belongs to, or null when it
     * falls outside the range.
     */
    public function indexFor(string|int|float $key): ?int
    {
        $date = CarbonImmutable::parse((string) $key)->startOfDay();

        if ($this->granularity === Granularity::Month) {
            $index = ($date->year - $this->from->year) * 12 + ($date->month - $this->from->month);
        } else {
            $days = (int) round($this->from->startOfDay()->setTime(12, 0)->diffInDays($date->setTime(12, 0)));
            $index = $this->granularity === Granularity::Week && $days >= 0 ? intdiv($days, 7) : $days;
        }

        return $index >= 0 && $index < $this->count() ? $index : null;
    }

    /**
     * @return list<array{start: CarbonImmutable, end: CarbonImmutable}>
     */
    private function buildSlots(): array
    {
        $slots = [];

        switch ($this->granularity) {
            case Granularity::Day:
                for ($day = $this->from->startOfDay(); $day->lte($this->to); $day = $day->addDay()) {
                    $slots[] = ['start' => $day, 'end' => $day->endOfDay()];
                }

                break;

            case Granularity::Week:
                for ($start = $this->from->startOfDay(); $start->lte($this->to); $start = $start->addDays(7)) {
                    $slots[] = ['start' => $start, 'end' => $start->addDays(6)->endOfDay()->min($this->to)];
                }

                break;

            case Granularity::Month:
                for ($month = $this->from->startOfMonth(); $month->lte($this->to); $month = $month->addMonthNoOverflow()) {
                    $slots[] = [
                        'start' => $month->max($this->from->startOfDay()),
                        'end' => $month->endOfMonth()->min($this->to),
                    ];
                }

                break;
        }

        return $slots;
    }
}
