<?php

use App\Services\Dashboard\DashboardRange;
use App\Services\Dashboard\Granularity;
use App\Services\Dashboard\TimeBuckets;
use Carbon\CarbonImmutable;

beforeEach(function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-10-15 12:00:00'));
});

afterEach(function () {
    CarbonImmutable::setTestNow();
});

test('the default range is the last 30 days', function () {
    $range = DashboardRange::resolve();

    expect($range->key)->toBe('30d')
        ->and($range->granularity)->toBe(Granularity::Day)
        ->and($range->from->toDateString())->toBe('2026-09-16')
        ->and($range->to->toDateString())->toBe('2026-10-15');
});

test('unknown keys fall back to the default range', function () {
    expect(DashboardRange::resolve('forever')->key)->toBe('30d');
});

test('presets compare against the equally long period before them', function (string $key, string $from, string $previousFrom, string $previousTo, Granularity $granularity) {
    $range = DashboardRange::resolve($key);

    expect($range->from->toDateString())->toBe($from)
        ->and($range->to->toDateString())->toBe('2026-10-15')
        ->and($range->previousFrom->toDateString())->toBe($previousFrom)
        ->and($range->previousTo->toDateString())->toBe($previousTo)
        ->and($range->granularity)->toBe($granularity);
})->with([
    'today' => ['today', '2026-10-15', '2026-10-14', '2026-10-14', Granularity::Day],
    '7 days' => ['7d', '2026-10-09', '2026-10-02', '2026-10-08', Granularity::Day],
    '30 days' => ['30d', '2026-09-16', '2026-08-17', '2026-09-15', Granularity::Day],
    '3 months' => ['3m', '2026-07-17', '2026-04-17', '2026-07-16', Granularity::Week],
    '12 months' => ['12m', '2025-11-01', '2024-11-01', '2025-10-15', Granularity::Month],
]);

test('a custom range is bucketed by its length', function (string $from, string $to, Granularity $granularity) {
    $range = DashboardRange::resolve('custom', $from, $to);

    expect($range->key)->toBe('custom')
        ->and($range->granularity)->toBe($granularity);
})->with([
    'single day' => ['2026-10-01', '2026-10-01', Granularity::Day],
    'a month' => ['2026-09-01', '2026-09-30', Granularity::Day],
    'a quarter' => ['2026-07-01', '2026-09-30', Granularity::Week],
    'a year' => ['2025-10-01', '2026-09-30', Granularity::Month],
]);

test('a custom range ends no later than today', function () {
    $range = DashboardRange::resolve('custom', '2026-10-10', '2026-12-31');

    expect($range->to->toDateString())->toBe('2026-10-15');
});

test('unusable custom dates fall back to the default range', function (string $from, string $to) {
    expect(DashboardRange::resolve('custom', $from, $to)->key)->toBe('30d');
})->with([
    'missing dates' => ['', ''],
    'garbage' => ['not-a-date', '2026-10-01'],
    'overflowed date' => ['2026-02-31', '2026-03-05'],
    'reversed' => ['2026-10-10', '2026-10-01'],
    'entirely in the future' => ['2026-11-01', '2026-11-05'],
]);

test('very long custom ranges are trimmed', function () {
    $range = DashboardRange::resolve('custom', '2000-01-01', '2026-10-15');

    expect($range->from->diffInDays($range->to))->toBeLessThan(1096);
});

test('the label and sentence phrases describe the range', function () {
    expect(DashboardRange::resolve('7d')->toArray())->toMatchArray([
        'label' => 'Last 7 days',
        'comparison_label' => 'vs previous 7 days',
    ])->and(DashboardRange::resolve('today')->toArray()['comparison_label'])->toBe('vs yesterday')
        ->and(DashboardRange::resolve('custom', '2026-09-01', '2026-09-30')->label)->toBe('Sep 1 – Sep 30, 2026');
});

test('time buckets map database keys onto the right slot', function () {
    $days = new TimeBuckets(CarbonImmutable::parse('2026-10-09'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Day);
    $weeks = new TimeBuckets(CarbonImmutable::parse('2026-07-17'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Week);
    $months = new TimeBuckets(CarbonImmutable::parse('2025-11-01'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Month);

    expect($days->count())->toBe(7)
        ->and($days->indexFor('2026-10-09'))->toBe(0)
        ->and($days->indexFor('2026-10-15'))->toBe(6)
        ->and($days->indexFor('2026-10-08'))->toBeNull()
        ->and($days->indexFor('2026-10-16'))->toBeNull()
        ->and($weeks->count())->toBe(13)
        ->and($weeks->indexFor('2026-07-23'))->toBe(0)
        ->and($weeks->indexFor('2026-07-24'))->toBe(1)
        ->and($weeks->indexFor('2026-10-15'))->toBe(12)
        ->and($months->count())->toBe(12)
        ->and($months->indexFor('2025-11-30'))->toBe(0)
        ->and($months->indexFor('2026-10-01'))->toBe(11);
});

test('time buckets label themselves for the x axis and tooltip', function () {
    $days = new TimeBuckets(CarbonImmutable::parse('2026-10-09'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Day);
    $weeks = new TimeBuckets(CarbonImmutable::parse('2026-07-17'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Week);
    $months = new TimeBuckets(CarbonImmutable::parse('2025-11-01'), CarbonImmutable::parse('2026-10-15')->endOfDay(), Granularity::Month);

    expect($days->label(0))->toBe('Oct 9')
        ->and($days->title(0))->toBe('Fri, Oct 9, 2026')
        ->and($weeks->label(0))->toBe('Jul 17')
        ->and($weeks->title(12))->toBe('Oct 9 – Oct 15, 2026')
        ->and($months->label(0))->toBe("Nov '25")
        ->and($months->label(1))->toBe('Dec')
        ->and($months->label(2))->toBe("Jan '26")
        ->and($months->label(11))->toBe('Oct')
        ->and($months->title(11))->toBe('October 2026');
});
