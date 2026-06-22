<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\SellerController as AdminSellerController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ConversationController as AdminConversationController;
use App\Http\Controllers\Api\Admin\PenaltyController as AdminPenaltyController;
use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Seller\StoreController as SellerStoreController;
use App\Http\Controllers\Api\Seller\ProductController as SellerProductController;
use App\Http\Controllers\Api\Seller\ProductImageController;
use App\Http\Controllers\Api\Seller\OrderController as SellerOrderController;
use App\Http\Controllers\Api\Customer\CheckoutController;
use App\Http\Controllers\Api\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\Customer\ReviewController as CustomerReviewController;
use App\Http\Controllers\Api\Customer\WishlistController;
use Illuminate\Support\Facades\Route;

// ===== Auth =====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ===== Public =====
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/stores/{slug}', [StoreController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

// ===== Authenticated =====
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Messages ---
    Route::prefix('messages')->group(function () {
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::get('/conversations/{id}', [MessageController::class, 'show']);
        Route::post('/send', [MessageController::class, 'store']);
    });

    // --- Admin ---
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('categories', AdminCategoryController::class);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}/status', [AdminUserController::class, 'updateStatus']);

        Route::get('/sellers', [AdminSellerController::class, 'index']);
        Route::get('/sellers/{id}', [AdminSellerController::class, 'show']);
        Route::put('/sellers/{id}/verify', [AdminSellerController::class, 'verify']);
        Route::put('/sellers/{id}/suspend', [AdminSellerController::class, 'suspend']);

        Route::get('/products', [AdminProductController::class, 'index']);
        Route::get('/products/{id}', [AdminProductController::class, 'show']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);
        Route::put('/products/{id}/toggle-active', [AdminProductController::class, 'toggleActive']);

        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}', [AdminOrderController::class, 'show']);

        Route::get('/conversations', [AdminConversationController::class, 'index']);
        Route::get('/conversations/{id}', [AdminConversationController::class, 'show']);
        Route::delete('/conversations/{id}', [AdminConversationController::class, 'destroy']);

        Route::get('/penalties', [AdminPenaltyController::class, 'index']);
        Route::post('/penalties', [AdminPenaltyController::class, 'store']);

        Route::get('/analytics/dashboard', [AdminAnalyticsController::class, 'dashboard']);
    });

    // --- Seller ---
    Route::middleware('seller')->prefix('seller')->group(function () {
        Route::get('/store', [SellerStoreController::class, 'show']);
        Route::post('/store', [SellerStoreController::class, 'store']);
        Route::put('/store', [SellerStoreController::class, 'update']);

        Route::apiResource('products', SellerProductController::class)->except(['index', 'show']);
        Route::get('/products', [SellerProductController::class, 'index']);
        Route::get('/products/{id}', [SellerProductController::class, 'show']);

        Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
        Route::put('/products/{product}/images/{image}/primary', [ProductImageController::class, 'setPrimary']);
        Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);

        Route::get('/orders', [SellerOrderController::class, 'index']);
        Route::get('/orders/{id}', [SellerOrderController::class, 'show']);
        Route::put('/orders/{id}/status', [SellerOrderController::class, 'updateStatus']);
    });

    // --- Customer ---
    Route::prefix('customer')->group(function () {
        Route::post('/checkout', [CheckoutController::class, 'store']);
        Route::get('/orders', [CustomerOrderController::class, 'index']);
        Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);
        Route::put('/orders/{id}/cancel', [CustomerOrderController::class, 'cancel']);

        Route::post('/reviews', [CustomerReviewController::class, 'store']);
        Route::put('/reviews/{id}', [CustomerReviewController::class, 'update']);
        Route::delete('/reviews/{id}', [CustomerReviewController::class, 'destroy']);
        Route::get('/reviews', [CustomerReviewController::class, 'myReviews']);

        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    });
});