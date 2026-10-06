<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('account/index', [
            'stats' => self::stats($user),
            'recentOrders' => $user->orders()
                ->with('items.product:id,name,image_path')
                ->withCount('items')
                ->latest()
                ->limit(3)
                ->get(),
            'defaultAddress' => $user->defaultAddress()->first(),
        ]);
    }

    /**
     * @return array{orders: int, wishlist: int}
     */
    public static function stats(User $user): array
    {
        return [
            'orders' => $user->orders()->count(),
            'wishlist' => WishlistItem::query()->where('user_id', $user->id)->count(),
        ];
    }
}
