<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'Centimeter', 'code' => 'cm', 'conversion_factor' => 1],
            ['name' => 'Meter', 'code' => 'm', 'conversion_factor' => 100],
            ['name' => 'Millimeter', 'code' => 'mm', 'conversion_factor' => 0.1],
            ['name' => 'Inch', 'code' => 'inch', 'conversion_factor' => 2.54],
            ['name' => 'Feet', 'code' => 'ft', 'conversion_factor' => 30.48],
            ['name' => 'Piece', 'code' => 'pc', 'conversion_factor' => 1],
            ['name' => 'Roll', 'code' => 'roll', 'conversion_factor' => 1],
        ];

        foreach ($units as $unit) {
            Unit::query()->firstOrCreate(['code' => $unit['code']], $unit);
        }
    }
}
