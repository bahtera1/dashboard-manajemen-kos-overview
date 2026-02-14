<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Masukkan data admin awal
        // Cek apakah admin sudah ada
        if (!DB::table('users')->where('email', 'admin1@gmail.com')->exists()) {
            DB::table('users')->insert([
                'name' => 'Admin',
                'email' => 'admin1@gmail.com',
                'password' => Hash::make('01admin01'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
