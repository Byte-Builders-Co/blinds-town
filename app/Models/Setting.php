<?php

namespace App\Models;

use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * @property int $id
 * @property string $key
 * @property mixed $value
 * @property string $group
 */
#[Fillable(['key', 'value', 'group'])]
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory;

    private const CACHE_KEY = 'app-settings';

    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    /**
     * Get a single setting value by its "group.key" name, falling back to
     * the configured default (or the given default) when unset.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $stored = self::cached()->get($key);

        if ($stored !== null) {
            return $stored;
        }

        return $default ?? self::defaultFor($key);
    }

    public static function set(string $key, mixed $value): void
    {
        [$group] = explode('.', $key, 2);

        static::query()->updateOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * All settings for a group, merged over their configured defaults.
     *
     * @return array<string, mixed>
     */
    public static function group(string $group): array
    {
        $defaults = config("settings.defaults.{$group}", []);
        $stored = self::cached();

        $values = [];

        foreach ($defaults as $key => $default) {
            $values[$key] = $stored->get("{$group}.{$key}", $default);
        }

        return $values;
    }

    /**
     * All settings, keyed by "group.key", cached for the request lifecycle
     * and across requests until the next write.
     *
     * @return Collection<string, mixed>
     */
    private static function cached(): Collection
    {
        $cached = Cache::get(self::CACHE_KEY);

        if ($cached instanceof Collection) {
            return $cached;
        }

        $fresh = static::query()->get()->pluck('value', 'key');
        Cache::forever(self::CACHE_KEY, $fresh);

        return $fresh;
    }

    private static function defaultFor(string $key): mixed
    {
        [$group, $name] = explode('.', $key, 2) + [1 => null];

        return Arr::get(config('settings.defaults'), "{$group}.{$name}");
    }
}
