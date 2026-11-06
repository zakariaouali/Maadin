<?php

namespace Tests\Concerns;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\User;

/**
 * Small helpers to build the people and products the shop tests need.
 * (The project has no model factories apart from the default user one.)
 */
trait BuildsShop
{
    protected function makeCustomer(string $email = 'buyer@example.test'): User
    {
        return User::create([
            'name' => 'Test Buyer', 'email' => $email, 'password' => 'secret-pass-123',
            'role' => 'customer', 'plan' => 'starter', 'status' => 'active', 'locale' => 'en',
        ]);
    }

    /** A verified store and its owner. */
    protected function makeSeller(string $email = 'seller@example.test', string $store = 'Test Store', string $plan = 'starter'): Seller
    {
        $user = User::create([
            'name' => 'Test Seller', 'email' => $email, 'password' => 'secret-pass-123',
            'role' => 'seller', 'plan' => $plan, 'status' => 'active', 'locale' => 'en',
        ]);

        return Seller::create([
            'user_id' => $user->id, 'store_name' => $store, 'store_slug' => str($store)->slug()->toString(),
            'phone_number' => '0600000000', 'status' => 'verified',
        ]);
    }

    protected function makeAdmin(string $email = 'admin@example.test'): User
    {
        return User::create([
            'name' => 'Test Admin', 'email' => $email, 'password' => 'secret-pass-123',
            'role' => 'admin', 'plan' => 'starter', 'status' => 'active', 'locale' => 'en',
        ]);
    }

    protected function makeProduct(Seller $seller, array $attrs = []): Product
    {
        // Created per call: each test runs inside a rolled-back transaction, so a shared one would vanish
        $category = Category::create(['name' => 'Woodwork', 'slug' => 'woodwork-' . uniqid(), 'is_active' => true]);

        return Product::create(array_merge([
            'seller_id' => $seller->id, 'category_id' => $category->id,
            'name' => 'Test product', 'slug' => 'test-product-' . uniqid(),
            'description' => 'A test product.', 'price' => 100, 'stock_quantity' => 5,
            'is_made_to_order' => false, 'is_active' => true, 'is_approved' => true,
        ], $attrs));
    }

    /** Body for POST /api/customer/checkout. */
    protected function checkoutPayload(array $items, string $key = null): array
    {
        return [
            'idempotency_key' => $key ?? uniqid('key-', true),
            'items' => $items,
            'shipping_address' => '12 Rue Test', 'shipping_city' => 'Marrakech', 'shipping_phone' => '0612345678',
        ];
    }
}
