# MAADIN Marketplace - Phase 3: Laravel Backend Architecture

**Status**: 🟡 ARCHITECTURE & PLANNING PHASE  
**Deliverables**: Backend structure, authentication, API design, folder organization

---

## 1. LARAVEL PROJECT SETUP OVERVIEW

### 1.1 Technology Stack (Confirmed)

```
Framework:     Laravel 12
PHP:           8.3+
Database:      MySQL 8.0+
Authentication: Laravel Sanctum (token-based)
API Response:  JSON
Server:        Single VPS (Nginx/Apache)
Queue:         Redis (Phase 2+) | Database (Phase 1)
Cache:         File (Phase 1) | Redis (Phase 2+)
```

### 1.2 Project Directory Structure

```
maadin-backend/
├── app/
│   ├── Console/
│   │   ├── Commands/
│   │   │   ├── LiftExpiredPenalties.php
│   │   │   ├── UpdateSellerMetrics.php
│   │   │   └── CleanupCarts.php
│   │   └── Kernel.php
│   ├── Events/
│   │   ├── OrderCreated.php
│   │   ├── OrderShipped.php
│   │   ├── MessageSent.php
│   │   └── ReviewCreated.php
│   ├── Exceptions/
│   │   ├── Handler.php
│   │   ├── UnauthorizedException.php
│   │   ├── ForbiddenException.php
│   │   ├── ValidationException.php
│   │   └── ResourceNotFoundException.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── RegisterController.php
│   │   │   │   │   ├── LoginController.php
│   │   │   │   │   ├── LogoutController.php
│   │   │   │   │   └── VerifyEmailController.php
│   │   │   │   ├── Customer/
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   ├── WishlistController.php
│   │   │   │   │   ├── MessageController.php
│   │   │   │   │   └── ProfileController.php
│   │   │   │   ├── Seller/
│   │   │   │   │   ├── StoreController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── AnalyticsController.php
│   │   │   │   │   └── MessageController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── UserController.php
│   │   │   │       ├── SellerController.php
│   │   │   │       ├── ProductController.php
│   │   │   │       ├── OrderController.php
│   │   │   │       ├── ConversationController.php
│   │   │   │       ├── PenaltyController.php
│   │   │   │       └── AnalyticsController.php
│   │   │   └── HealthCheckController.php
│   │   ├── Middleware/
│   │   │   ├── EnsureEmailIsVerified.php
│   │   │   ├── EnsureSellerVerified.php
│   │   │   ├── EnsureUserIsAdmin.php
│   │   │   ├── RateLimitApiRequests.php
│   │   │   ├── LogApiRequests.php
│   │   │   └── ValidateContentFiltering.php
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── LoginRequest.php
│   │       │   ├── RegisterRequest.php
│   │       │   └── VerifyEmailRequest.php
│   │       ├── Product/
│   │       │   ├── StoreProductRequest.php
│   │       │   └── UpdateProductRequest.php
│   │       ├── Order/
│   │       │   ├── StoreOrderRequest.php
│   │       │   └── UpdateOrderStatusRequest.php
│   │       └── Message/
│   │           └── StoreMessageRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Seller.php
│   │   ├── Category.php
│   │   ├── Product.php
│   │   ├── ProductImage.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Review.php
│   │   ├── Wishlist.php
│   │   ├── Conversation.php
│   │   ├── Message.php
│   │   ├── Penalty.php
│   │   ├── Cart.php
│   │   └── AdminAuditLog.php
│   ├── Policies/
│   │   ├── UserPolicy.php
│   │   ├── SellerPolicy.php
│   │   ├── ProductPolicy.php
│   │   ├── OrderPolicy.php
│   │   ├── MessagePolicy.php
│   │   └── AdminPolicy.php
│   ├── Services/
│   │   ├── Auth/
│   │   │   ├── AuthenticationService.php
│   │   │   ├── EmailVerificationService.php
│   │   │   └── PasswordResetService.php
│   │   ├── Order/
│   │   │   ├── OrderService.php
│   │   │   ├── CartService.php
│   │   │   └── CheckoutService.php
│   │   ├── Messaging/
│   │   │   ├── MessageService.php
│   │   │   ├── ConversationService.php
│   │   │   └── ContentFilterService.php
│   │   ├── Product/
│   │   │   ├── ProductService.php
│   │   │   ├── SearchService.php
│   │   │   └── ImageService.php
│   │   ├── Review/
│   │   │   └── ReviewService.php
│   │   ├── Seller/
│   │   │   ├── SellerService.php
│   │   │   └── PenaltyService.php
│   │   └── Admin/
│   │       ├── AdminService.php
│   │       └── AnalyticsService.php
│   └── Traits/
│       ├── HasApiResponses.php
│       ├── HasUniqueSlug.php
│       ├── FilterableQuery.php
│       └── SoftDeletesWithRestore.php
├── bootstrap/
├── config/
│   ├── app.php
│   ├── database.php
│   ├── sanctum.php
│   ├── mail.php
│   ├── cache.php
│   ├── queue.php
│   ├── filesystems.php
│   ├── logging.php
│   └── maadin.php (custom config)
├── database/
│   ├── migrations/
│   │   ├── 2026_01_01_000001_create_users_table.php
│   │   ├── 2026_01_01_000002_create_sellers_table.php
│   │   ├── ... (all 14 tables)
│   │   └── 2026_01_01_000014_create_admin_audit_logs_table.php
│   ├── factories/
│   │   ├── UserFactory.php
│   │   ├── SellerFactory.php
│   │   ├── ProductFactory.php
│   │   ├── OrderFactory.php
│   │   └── ReviewFactory.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── SellerSeeder.php
│       ├── CategorySeeder.php
│       ├── ProductSeeder.php
│       └── ReviewSeeder.php
├── resources/
│   ├── views/ (email templates)
│   │   ├── emails/
│   │   │   ├── verify-email.blade.php
│   │   │   ├── reset-password.blade.php
│   │   │   ├── order-confirmation.blade.php
│   │   │   └── seller-verification.blade.php
│   │   └── errors/ (API error pages)
│   └── lang/
│       └── en/
│           ├── messages.php
│           ├── validation.php
│           └── errors.php
├── routes/
│   ├── web.php (for redirects if needed)
│   └── api.php (main API routes)
├── storage/
│   ├── app/
│   │   ├── public/
│   │   │   ├── products/images/
│   │   │   ├── stores/logos/
│   │   │   ├── stores/banners/
│   │   │   ├── users/avatars/
│   │   │   └── temp/
│   │   └── logs/
│   ├── logs/
│   └── framework/
├── tests/
│   ├── Unit/
│   │   ├── Services/
│   │   └── Models/
│   ├── Feature/
│   │   ├── Api/Auth/
│   │   ├── Api/Customer/
│   │   ├── Api/Seller/
│   │   └── Api/Admin/
│   └── CreatesApplication.php
├── .env.example
├── artisan
├── composer.json
├── phpunit.xml
└── README.md
```

---

## 2. AUTHENTICATION SYSTEM (Laravel Sanctum)

### 2.1 Authentication Flow

```
User submits credentials
        ↓
LoginController validates input
        ↓
AuthenticationService→ Hash check
        ↓
Generate Sanctum token
        ↓
Return token + user data
        ↓
Client stores token (localStorage)
        ↓
All subsequent requests include token in header:
Authorization: Bearer {token}
        ↓
Sanctum middleware validates token
        ↓
Request processed with authenticated user context
```

### 2.2 Authentication Controllers

#### LoginController
```php
// app/Http/Controllers/Api/Auth/LoginController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(private AuthenticationService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $result = $this->authService->authenticate(
                email: $request->email,
                password: $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $result['user'],
                    'token' => $result['token'],
                ]
            ], 200);
        } catch (AuthenticationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }
}
```

#### RegisterController
```php
// app/Http/Controllers/Api/Auth/RegisterController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthenticationService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(private AuthenticationService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $user = $this->authService->register(
                name: $request->name,
                email: $request->email,
                password: $request->password,
                phone: $request->phone,
                role: 'customer' // default role
            );

            // Send verification email (queued)
            Mail::queue(new VerifyEmailMailable($user));

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please verify your email.',
                'data' => [
                    'user' => $user,
                ]
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }
}
```

#### VerifyEmailController
```php
// app/Http/Controllers/Api/Auth/VerifyEmailController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\EmailVerificationService;
use Illuminate\Http\JsonResponse;

class VerifyEmailController extends Controller
{
    public function __construct(private EmailVerificationService $verificationService) {}

    public function verify($token): JsonResponse
    {
        try {
            $this->verificationService->verifyEmail($token);

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully'
            ], 200);
        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification token expired'
            ], 410);
        }
    }
}
```

### 2.3 Authentication Service

```php
// app/Services/Auth/AuthenticationService.php

namespace App\Services\Auth;

use App\Models\User;
use Hash;
use Illuminate\Support\Str;

class AuthenticationService
{
    public function authenticate(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        if ($user->status === 'banned') {
            throw new AuthenticationException('Account has been banned');
        }

        if ($user->status === 'suspended') {
            throw new AuthenticationException('Account has been suspended');
        }

        if (!$user->email_verified_at) {
            throw new AuthenticationException('Please verify your email first');
        }

        // Generate Sanctum token
        $token = $user->createToken('api-token')->plainTextToken;

        // Update last login
        $user->update(['last_login_at' => now()]);

        return [
            'user' => $user->toArray(),
            'token' => $token
        ];
    }

    public function register(string $name, string $email, string $password, string $phone, string $role): User
    {
        // Check if user exists
        if (User::where('email', $email)->exists()) {
            throw new ValidationException('Email already registered');
        }

        // Create user
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => $phone,
            'role' => $role,
            'status' => 'active'
        ]);

        return $user;
    }

    public function logout(User $user): void
    {
        // Revoke all tokens
        $user->tokens()->delete();
    }
}
```

### 2.4 Sanctum Configuration

```php
// config/sanctum.php (key settings)

return [
    // Expiration in minutes (30 days = 43200 minutes)
    'expiration' => 43200,

    // Domains that can use tokens
    'guard' => ['web'],

    // Middleware for API requests
    'middleware' => [
        'verify_csrf_token' => false, // CSRF not needed for token auth
        'encrypt_cookies' => false,
    ],
];
```

---

## 3. API ROUTE STRUCTURE

### 3.1 Route Organization (routes/api.php)

```php
// Public endpoints (no authentication required)
Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [RegisterController::class, 'register']);
        Route::post('login', [LoginController::class, 'login']);
        Route::post('forgot-password', [PasswordResetController::class, 'forgot']);
        Route::post('reset-password', [PasswordResetController::class, 'reset']);
        Route::get('verify-email/{token}', [VerifyEmailController::class, 'verify']);
    });

    // Public product browsing
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/{product:slug}', [ProductController::class, 'show']);
        Route::get('/search', [ProductController::class, 'search']);
    });

    // Public store viewing
    Route::prefix('stores')->group(function () {
        Route::get('/{seller:store_slug}', [StoreController::class, 'show']);
    });

    // Protected endpoints (authentication required)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Common endpoints
        Route::post('auth/logout', [LogoutController::class, 'logout']);
        Route::get('auth/me', [ProfileController::class, 'me']);
        Route::put('auth/profile', [ProfileController::class, 'update']);

        // Customer endpoints
        Route::middleware('customer')->prefix('customer')->group(function () {
            // Cart
            Route::prefix('cart')->group(function () {
                Route::get('/', [CartController::class, 'index']);
                Route::post('/items', [CartController::class, 'addItem']);
                Route::put('/items/{item}', [CartController::class, 'updateItem']);
                Route::delete('/items/{item}', [CartController::class, 'removeItem']);
                Route::delete('/', [CartController::class, 'clear']);
            });

            // Orders
            Route::prefix('orders')->group(function () {
                Route::get('/', [OrderController::class, 'index']);
                Route::post('/', [OrderController::class, 'store']);
                Route::get('/{order}', [OrderController::class, 'show']);
                Route::put('/{order}', [OrderController::class, 'update']);
            });

            // Reviews
            Route::prefix('reviews')->group(function () {
                Route::post('/', [ReviewController::class, 'store']);
                Route::put('/{review}', [ReviewController::class, 'update']);
                Route::delete('/{review}', [ReviewController::class, 'destroy']);
            });

            // Wishlist
            Route::prefix('wishlist')->group(function () {
                Route::get('/', [WishlistController::class, 'index']);
                Route::post('/items', [WishlistController::class, 'addItem']);
                Route::delete('/items/{product}', [WishlistController::class, 'removeItem']);
            });

            // Messages
            Route::prefix('messages')->group(function () {
                Route::get('/conversations', [MessageController::class, 'conversations']);
                Route::get('/conversations/{conversation}', [MessageController::class, 'show']);
                Route::post('/send', [MessageController::class, 'store']);
                Route::put('/{message}', [MessageController::class, 'markAsRead']);
            });
        });

        // Seller endpoints
        Route::middleware('seller')->prefix('seller')->group(function () {
            // Store management
            Route::prefix('store')->group(function () {
                Route::get('/', [StoreController::class, 'index']);
                Route::put('/', [StoreController::class, 'update']);
                Route::post('/logo', [StoreController::class, 'uploadLogo']);
                Route::post('/banner', [StoreController::class, 'uploadBanner']);
            });

            // Products
            Route::prefix('products')->group(function () {
                Route::get('/', [ProductController::class, 'sellerProducts']);
                Route::post('/', [ProductController::class, 'store']);
                Route::get('/{product}', [ProductController::class, 'show']);
                Route::put('/{product}', [ProductController::class, 'update']);
                Route::delete('/{product}', [ProductController::class, 'destroy']);
                Route::post('/{product}/images', [ProductController::class, 'uploadImages']);
            });

            // Orders
            Route::prefix('orders')->group(function () {
                Route::get('/', [OrderController::class, 'sellerOrders']);
                Route::get('/{order}', [OrderController::class, 'show']);
                Route::put('/{order}/status', [OrderController::class, 'updateStatus']);
            });

            // Messages
            Route::prefix('messages')->group(function () {
                Route::get('/conversations', [MessageController::class, 'conversations']);
                Route::get('/conversations/{conversation}', [MessageController::class, 'show']);
                Route::post('/send', [MessageController::class, 'store']);
            });

            // Analytics
            Route::prefix('analytics')->group(function () {
                Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
                Route::get('/sales', [AnalyticsController::class, 'sales']);
                Route::get('/products', [AnalyticsController::class, 'products']);
            });
        });

        // Admin endpoints
        Route::middleware('admin')->prefix('admin')->group(function () {
            // User management
            Route::apiResource('users', UserController::class);
            Route::put('/users/{user}/status', [UserController::class, 'updateStatus']);
            Route::put('/users/{user}/ban', [UserController::class, 'ban']);

            // Seller management
            Route::apiResource('sellers', SellerController::class);
            Route::put('/sellers/{seller}/verify', [SellerController::class, 'verify']);
            Route::put('/sellers/{seller}/suspend', [SellerController::class, 'suspend']);

            // Product moderation
            Route::apiResource('products', ProductController::class);
            Route::delete('/products/{product}/approve', [ProductController::class, 'approve']);

            // Order management
            Route::apiResource('orders', OrderController::class, ['only' => ['index', 'show']]);

            // Conversations & Moderation
            Route::prefix('conversations')->group(function () {
                Route::get('/', [ConversationController::class, 'index']);
                Route::get('/{conversation}', [ConversationController::class, 'show']);
                Route::delete('/{conversation}', [ConversationController::class, 'destroy']);
            });

            // Penalties
            Route::apiResource('penalties', PenaltyController::class);

            // Analytics
            Route::prefix('analytics')->group(function () {
                Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
                Route::get('/users', [AnalyticsController::class, 'users']);
                Route::get('/revenue', [AnalyticsController::class, 'revenue']);
            });
        });
    });

    // Health check (no auth)
    Route::get('/health', [HealthCheckController::class, 'check']);
});
```

---

## 4. AUTHORIZATION POLICIES

### 4.1 Policy Architecture

**Gate vs Policy**:
- **Gates**: Simple yes/no checks (e.g., `can('edit-users')`)
- **Policies**: Model-based authorization (e.g., `can('update', $order)`)

### 4.2 Order Policy Example

```php
// app/Policies/OrderPolicy.php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    // Admin can do anything
    public function before(User $user, string $ability): bool|null
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    // Customer can view their own orders
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->customer_id;
    }

    // Customer can update their own pending orders
    public function update(User $user, Order $order): bool
    {
        return $user->id === $order->customer_id && $order->status === 'pending';
    }

    // Seller can view their own orders
    public function viewBySeller(User $user, Order $order): bool
    {
        return $user->seller && $user->seller->id === $order->seller_id;
    }

    // Seller can update status on their orders
    public function updateStatus(User $user, Order $order): bool
    {
        return $user->seller && $user->seller->id === $order->seller_id;
    }
}
```

### 4.3 Message Policy (Content Moderation)

```php
// app/Policies/MessagePolicy.php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function before(User $user, string $ability): bool|null
    {
        // Admin can view all messages
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    // Users can only view their own messages
    public function view(User $user, Message $message): bool
    {
        return $user->id === $message->sender_id || $user->id === $message->receiver_id;
    }

    // Can only send messages to conversations they're in
    public function create(User $user): bool
    {
        return $user->role === 'customer' || $user->role === 'seller';
    }

    // Admin can delete messages for moderation
    public function delete(User $user, Message $message): bool
    {
        return $user->role === 'admin';
    }
}
```

### 4.4 Authorization Registration (AppServiceProvider)

```php
// app/Providers/AuthServiceProvider.php

use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\MessagePolicy;
use App\Models\Order;
use App\Models\Product;
use App\Models\Message;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Order::class => OrderPolicy::class,
        Product::class => ProductPolicy::class,
        Message::class => MessagePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Define custom gates
        Gate::define('moderate-conversations', function (User $user) {
            return $user->role === 'admin';
        });

        Gate::define('apply-penalties', function (User $user) {
            return $user->role === 'admin';
        });
    }
}
```

---

## 5. ERROR HANDLING & RESPONSES

### 5.1 Custom Exception Classes

```php
// app/Exceptions/AuthenticationException.php
class AuthenticationException extends Exception {}

// app/Exceptions/ForbiddenException.php
class ForbiddenException extends Exception {}

// app/Exceptions/ResourceNotFoundException.php
class ResourceNotFoundException extends Exception {}

// app/Exceptions/ValidationException.php
class ValidationException extends Exception
{
    public function __construct(public array $errors = []) {
        parent::__construct('Validation failed');
    }
}
```

### 5.2 Exception Handler

```php
// app/Exceptions/Handler.php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException as LaravelValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Handler extends ExceptionHandler
{
    public function render($request, Throwable $exception)
    {
        // JSON API error responses
        if ($request->expectsJson()) {
            
            // Validation errors
            if ($exception instanceof LaravelValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $exception->errors()
                ], 422);
            }

            // Not found
            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found'
                ], 404);
            }

            // Custom exceptions
            if ($exception instanceof ResourceNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage()
                ], 404);
            }

            if ($exception instanceof ForbiddenException) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to perform this action'
                ], 403);
            }

            if ($exception instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage()
                ], 401);
            }

            // Generic error
            return response()->json([
                'success' => false,
                'message' => config('app.debug') ? $exception->getMessage() : 'Server error'
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
```

### 5.3 Consistent Response Format

```php
// app/Traits/HasApiResponses.php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait HasApiResponses
{
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    protected function errorResponse(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }

    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }
}
```

**Usage in Controllers**:
```php
class ProductController extends Controller
{
    use HasApiResponses;

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return $this->successResponse(
            data: $product,
            message: 'Product created successfully',
            code: 201
        );
    }

    public function show(Product $product): JsonResponse
    {
        if (!$product->is_active) {
            return $this->errorResponse('Product not found', 404);
        }

        return $this->successResponse($product);
    }
}
```

---

## 6. CORE API ENDPOINTS SUMMARY

### 6.1 Authentication Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/auth/register` | No | Customer registration |
| POST | `/api/v1/auth/login` | No | User login |
| POST | `/api/v1/auth/logout` | Yes | User logout |
| GET | `/api/v1/auth/me` | Yes | Get authenticated user |
| PUT | `/api/v1/auth/profile` | Yes | Update profile |
| GET | `/api/v1/auth/verify-email/{token}` | No | Verify email |
| POST | `/api/v1/auth/forgot-password` | No | Password reset request |
| POST | `/api/v1/auth/reset-password` | No | Reset password |

### 6.2 Product Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/products` | No | Browse all |
| GET | `/api/v1/products/{id}` | No | View details |
| GET | `/api/v1/products/search` | No | Search |
| POST | `/api/v1/seller/products` | Yes | Seller create |
| GET | `/api/v1/seller/products` | Yes | Seller list own |
| PUT | `/api/v1/seller/products/{id}` | Yes | Seller edit |
| DELETE | `/api/v1/seller/products/{id}` | Yes | Seller delete |

### 6.3 Order Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/customer/orders` | Yes | Customer list |
| POST | `/api/v1/customer/orders` | Yes | Customer create |
| GET | `/api/v1/customer/orders/{id}` | Yes | Customer view |
| GET | `/api/v1/seller/orders` | Yes | Seller list |
| PUT | `/api/v1/seller/orders/{id}/status` | Yes | Seller update status |

### 6.4 Message Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/customer/messages/conversations` | Yes | List conversations |
| GET | `/api/v1/customer/messages/conversations/{id}` | Yes | View conversation |
| POST | `/api/v1/customer/messages/send` | Yes | Send message |
| PUT | `/api/v1/customer/messages/{id}` | Yes | Mark as read |

---

## 7. DATABASE MODELS

### 7.1 User Model Structure

```php
// app/Models/User.php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role', 'status', 'avatar_path'
    ];

    protected $hidden = ['password'];

    // Relationships
    public function seller()
    {
        return $this->hasOne(Seller::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class, 'customer_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    // Scopes
    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    public function scopeSellers($query)
    {
        return $query->where('role', 'seller');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```

### 7.2 Product Model Structure

```php
// app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'seller_id', 'category_id', 'name', 'slug', 'description',
        'short_description', 'price', 'cost', 'stock_quantity',
        'sku', 'is_active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    // Mutators
    public function getPrimaryImageAttribute()
    {
        return $this->images()->where('is_primary', true)->first();
    }
}
```

### 7.3 Order Model Structure

```php
// app/Models/Order.php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id', 'seller_id', 'order_number', 'status',
        'total_price', 'shipping_address', 'shipping_city',
        'shipping_phone', 'payment_method', 'notes'
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime'
    ];

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // Scopes
    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
```

---

## 8. MIDDLEWARE OVERVIEW

### 8.1 Key Middleware

```php
// app/Http/Middleware/EnsureEmailIsVerified.php
// Prevent unverified emails from ordering

// app/Http/Middleware/EnsureSellerVerified.php
// Prevent unverified sellers from listing products

// app/Http/Middleware/EnsureUserIsAdmin.php
// Restrict access to admin endpoints

// app/Http/Middleware/RateLimitApiRequests.php
// Rate limiting: 100 requests/min (unauth), 500/min (auth)

// app/Http/Middleware/LogApiRequests.php
// Log all API requests for debugging

// app/Http/Middleware/ValidateContentFiltering.php
// Apply content filtering to messages before saving
```

---

## 9. DIRECTORY ORGANIZATION SUMMARY

### 9.1 Key Directories

| Directory | Purpose | Files |
|-----------|---------|-------|
| `app/Models` | Database models with relationships | 14 models |
| `app/Http/Controllers/Api` | API endpoints organized by role | 20+ controllers |
| `app/Services` | Business logic isolated from controllers | 10+ services |
| `app/Policies` | Authorization rules for resources | 6 policies |
| `database/migrations` | Database schema creation | 14 migrations |
| `database/seeders` | Test data generation | 5 seeders |
| `routes/api.php` | API route definitions | 1 file (comprehensive) |
| `config/maadin.php` | Application-specific config | 1 file |

---

## 10. ENVIRONMENT VARIABLES (.env)

```bash
APP_NAME=MAADIN
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.maadin.ma
APP_TIMEZONE=Africa/Casablanca

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=maadin_marketplace
DB_USERNAME=maadin_user
DB_PASSWORD=secure_password

# Mail
MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@maadin.ma

# Sanctum
SANCTUM_STATEFUL_DOMAINS=app.maadin.ma
SESSION_DOMAIN=.maadin.ma

# Redis (Phase 2)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# File Storage
FILESYSTEM_DISK=local
STORAGE_URL=/storage

# Queue (Phase 1: database, Phase 2: redis)
QUEUE_CONNECTION=database
```

---

## 11. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All migrations tested locally
- [ ] Seeders generate correct test data
- [ ] All tests passing (unit + feature)
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificate ready
- [ ] Nginx/Apache config prepared

### Deployment Steps
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --no-dev --optimize-autoloader

# 3. Run migrations
php artisan migrate --force

# 4. Clear cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# 5. Restart workers (if using queue)
php artisan queue:restart

# 6. Test health endpoint
curl https://api.maadin.ma/api/v1/health
```

---

## 12. NEXT STEPS (Phase 3 COMPLETE)

✅ **Phase 3 Deliverables**:
1. ✓ Laravel backend architecture documented
2. ✓ Complete folder structure defined
3. ✓ Authentication system designed (Sanctum)
4. ✓ API route structure organized
5. ✓ Authorization policies defined
6. ✓ Error handling strategy detailed
7. ✓ Database models outlined
8. ✓ Middleware strategy documented
9. ✓ Deployment process defined

### 🔄 Upon Approval, Phase 4 Begins:
- Next.js frontend architecture
- Page structure and routing
- UI component organization
- SEO strategy
- State management (TanStack Query)
- TypeScript setup

---

**Document Version**: 3.0  
**Status**: 🟡 AWAITING APPROVAL FOR PHASE 4
