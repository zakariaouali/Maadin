<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ────────────────────────────────────────────────────────────
        User::create([
            'name'     => 'Admin Maadine',
            'email'    => 'admin@maadine.ma',
            'password' => Hash::make('password'),
            'role'     => 'admin',
            'plan'     => 'starter',
            'status'   => 'active',
        ]);

        // ── Customers ────────────────────────────────────────────────────────
        $customers = [
            ['name' => 'Youssef Bennani',   'email' => 'youssef@example.com'],
            ['name' => 'Fatima Zahra',       'email' => 'fatima@example.com'],
            ['name' => 'Karim Alaoui',       'email' => 'karim@example.com'],
        ];
        foreach ($customers as $c) {
            User::create([
                'name'     => $c['name'],
                'email'    => $c['email'],
                'password' => Hash::make('password'),
                'role'     => 'customer',
                'plan'     => 'starter',
                'status'   => 'active',
                'phone'    => '+212 6' . rand(10000000, 99999999),
            ]);
        }

        // ── Starter sellers ──────────────────────────────────────────────────
        $this->makeSeller('Layla Cherkaoui', 'layla@maadine.ma', 'starter', 'Layla Pottery', 'Handcrafted terracotta and zellige pieces from Fès.', '0661234567', 'verified', null, null);
        $this->makeSeller('Omar Tazi', 'omar@maadine.ma', 'starter', 'Tazi Leather', 'Authentic babouche slippers and leather bags from the Marrakech medina.', '0662345678', 'verified', null, null);

        // ── Managed sellers ──────────────────────────────────────────────────
        $this->makeSeller('Hassan Ouazzani', 'hassan@maadine.ma', 'managed', 'Ouazzani Textiles', 'Traditional Moroccan kilims and handwoven blankets.', '0663456789', 'verified', now()->addDays(18), 100);
        $this->makeSeller('Nadia Berrada', 'nadia@maadine.ma', 'managed', null, null, null, null, now()->addDays(2), 100); // no store yet, expiring soon

        // ── Premium sellers ──────────────────────────────────────────────────
        $this->makeSeller('Amine Tahiri', 'amine@maadine.ma', 'premium', 'Tahiri Lamps', 'Handcrafted brass and copper lanterns — Marrakech style.', '0664567890', 'verified', now()->addDays(45), 250);
        $this->makeSeller('Salma Idrissi', 'salma@maadine.ma', 'premium', 'Idrissi Jewels', 'Berber silver jewellery and hand-stamped accessories.', '0665678901', 'verified', now()->subDays(5), 250); // expired
    }

    private function makeSeller(
        string $name, string $email, string $plan,
        ?string $storeName, ?string $storeDesc, ?string $phone,
        ?string $status,
        ?\DateTimeInterface $expiresAt, ?int $monthlyFee
    ): User {
        $user = User::create([
            'name'                     => $name,
            'email'                    => $email,
            'password'                 => Hash::make('password'),
            'role'                     => 'seller',
            'plan'                     => $plan,
            'status'                   => 'active',
            'phone'                    => $phone,
            'subscription_expires_at'  => $expiresAt,
            'monthly_fee'              => $monthlyFee,
        ]);

        if ($storeName) {
            Seller::create([
                'user_id'           => $user->id,
                'store_name'        => $storeName,
                'store_slug'        => Str::slug($storeName),
                'store_description' => $storeDesc,
                'phone_number'      => $phone ?? '0600000000',
                'status'            => $status ?? 'verified',
            ]);
        }

        return $user;
    }
}
