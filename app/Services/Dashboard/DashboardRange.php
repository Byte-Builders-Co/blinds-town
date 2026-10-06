<?php

namespace App\Services\Dashboard;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

/**
 * The date range the admin dashboard is scoped to, plus the equally long
 * range immediately before it that every figure is compared against.
 */
final class DashboardRange
{
    public const DEFAULT = '30d';

    /** Longest custom range we will aggregate, in days. */
    private const MAX_CUSTOM_DAYS = 1095;

    private function __construct(
        public readonly string $key,
        public readonly CarbonImmutable $from,
        public readonly CarbonImmutable $to,
        public readonly CarbonImmutable $previousFrom,
        public readonly CarbonImmutable $previousTo,
        public readonly Granularity $granularity,
        public readonly string $label,
        public readonly string $phrase,
        public readonly string $previousPhrase,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return self::resolve(
            $request->string('range')->toString(),
            $request->string('from')->toString(),
            $request->string('to')->toString(),
        );
    }

    /**
     * Unknown keys and unusable custom dates fall back to the default range,
     * so a stale or hand-edited URL never breaks the dashboard.
     */
    public static function resolve(string $key = '', string $from = '', string $to = ''): self
    {
        $today = CarbonImmutable::now()->startOfDay();

        if ($key === 'custom') {
            $start = self::parseDate($from);
            $end = self::parseDate($to);

            if ($start !== null && $end !== null && $start->lte($end) && $start->lte($today)) {
                return self::custom($start, $end->min($today));
            }

            $key = self::DEFAULT;
        }

        $end = $today->endOfDay();

        return match ($key) {
            'today' => self::build('today', $today, $end, Granularity::Day, 'Today', 'today', 'yesterday'),
            '7d' => self::build('7d', $today->subDays(6), $end, Granularity::Day, 'Last 7 days', 'in the last 7 days', 'the previous 7 days'),
            // Thirteen whole weeks, so every weekly bucket is a full week.
            '3m' => self::build('3m', $today->subDays(90), $end, Granularity::Week, 'Last 3 months', 'in the last 3 months', 'the previous 3 months'),
            '12m' => self::build('12m', $today->startOfMonth()->subMonthsNoOverflow(11), $end, Granularity::Month, 'Last 12 months', 'in the last 12 months', 'the previous 12 months'),
            default => self::build('30d', $today->subDays(29), $end, Granularity::Day, 'Last 30 days', 'in the last 30 days', 'the previous 30 days'),
        };
    }

    /**
     * @return array{key: string, from: string, to: string, label: string, comparison_label: string, granularity: string}
     */
    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'from' => $this->from->toDateString(),
            'to' => $this->to->toDateString(),
            'label' => $this->label,
            'comparison_label' => 'vs '.Str::after($this->previousPhrase, 'the '),
            'granularity' => $this->granularity->value,
        ];
    }

    private static function custom(CarbonImmutable $start, CarbonImmutable $end): self
    {
        $days = self::daysBetween($start, $end);

        if ($days > self::MAX_CUSTOM_DAYS) {
            $start = $end->subDays(self::MAX_CUSTOM_DAYS - 1);
            $days = self::MAX_CUSTOM_DAYS;
        }

        $granularity = match (true) {
            $days <= 62 => Granularity::Day,
            $days <= 210 => Granularity::Week,
            default => Granularity::Month,
        };

        if ($start->isSameDay($end)) {
            $label = $start->format('M j, Y');
            $phrase = 'on '.$label;
        } else {
            $label = $start->year === $end->year
                ? $start->format('M j').' – '.$end->format('M j, Y')
                : $start->format('M j, Y').' – '.$end->format('M j, Y');
            $phrase = 'between '.$start->format('M j, Y').' and '.$end->format('M j, Y');
        }

        return self::build('custom', $start, $end->endOfDay(), $granularity, $label, $phrase, 'the previous period');
    }

    private static function build(
        string $key,
        CarbonImmutable $from,
        CarbonImmutable $to,
        Granularity $granularity,
        string $label,
        string $phrase,
        string $previousPhrase,
    ): self {
        if ($granularity === Granularity::Month) {
            // Shift by whole calendar months so every month bucket lines up
            // with the same month of the previous period.
            $months = ($to->year - $from->year) * 12 + ($to->month - $from->month) + 1;
            $previousFrom = $from->subMonthsNoOverflow($months);
            $previousTo = $to->subMonthsNoOverflow($months)->endOfDay();
        } else {
            $days = self::daysBetween($from, $to);
            $previousTo = $from->startOfDay()->subDay()->endOfDay();
            $previousFrom = $previousTo->startOfDay()->subDays($days - 1);
        }

        return new self($key, $from, $to, $previousFrom, $previousTo, $granularity, $label, $phrase, $previousPhrase);
    }

    private static function daysBetween(CarbonImmutable $from, CarbonImmutable $to): int
    {
        // Compare at noon so a DST change can never shift the day count.
        return (int) round($from->setTime(12, 0)->diffInDays($to->setTime(12, 0))) + 1;
    }

    private static function parseDate(string $value): ?CarbonImmutable
    {
        if ($value === '') {
            return null;
        }

        try {
            $date = CarbonImmutable::createFromFormat('!Y-m-d', $value);
        } catch (Throwable) {
            return null;
        }

        // Reject overflowed dates such as 2026-02-31.
        return $date instanceof CarbonImmutable && $date->format('Y-m-d') === $value ? $date : null;
    }
}
