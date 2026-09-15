<?php

namespace App\Models;

use App\Enums\AdminAlertType;
use Database\Factories\AdminAlertFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property AdminAlertType $type
 * @property string $title
 * @property string $message
 * @property string|null $link
 * @property Carbon|null $read_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read bool $is_read
 */
#[Fillable(['type', 'title', 'message', 'link', 'read_at'])]
class AdminAlert extends Model
{
    /** @use HasFactory<AdminAlertFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $appends = ['is_read'];

    protected function casts(): array
    {
        return [
            'type' => AdminAlertType::class,
            'read_at' => 'datetime',
        ];
    }

    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        if ($this->read_at === null) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * @param  Builder<AdminAlert>  $query
     * @return Builder<AdminAlert>
     */
    public function scopeUnread(Builder $query): Builder
    {
        return $query->whereNull('read_at');
    }
}
