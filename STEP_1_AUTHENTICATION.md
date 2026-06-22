# STEP 1: Authentication System - Implementation Guide

**Phase**: 5 - Implementation (Vertical Slice #1)  
**Status**: 🟡 IN PROGRESS  
**Deliverables**: Backend auth system + Frontend login/register

---

## ARCHITECTURE OVERVIEW

```
User Registration/Login
        ↓
Frontend (Next.js)
  ├─ RegisterForm Component
  ├─ LoginForm Component
  └─ useAuth Hook (state management)
        ↓ (HTTPS/JSON)
Backend (Laravel)
  ├─ RegisterController
  ├─ LoginController
  ├─ LogoutController
  ├─ User Model + Migration
  ├─ Sanctum Token Generation
  └─ Email Verification (basic)
        ↓ (JSON Response + Token)
Frontend (Next.js)
  ├─ Store token in localStorage
  ├─ Set auth state
  └─ Redirect to dashboard
```

---

## BACKEND IMPLEMENTATION (Laravel)

### 1. Database Migration: Create Users Table

**File**: `database/migrations/2026_01_01_000001_create_users_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->enum('role', ['customer', 'seller', 'admin'])->default('customer');
            $table->enum('status', ['active', 'suspended', 'banned'])->default('active');
            $table->string('avatar_path')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('email');
            $table->index('role');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### 2. User Model

**File**: `app/Models/User.php`

```php
<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'status',
        'avatar_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    /**
     * Get only verified users
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope: Get customers only
     */
    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    /**
     * Scope: Get sellers only
     */
    public function scopeSellers($query)
    {
        return $query->where('role', 'seller');
    }

    /**
     * Scope: Get admins only
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is seller
     */
    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }

    /**
     * Check if user is customer
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if email verified
     */
    public function isVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Check if account active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
```

### 3. Authentication Requests (Form Validation)

**File**: `app/Http/Requests/Auth/LoginRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Please provide a valid email',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
        ];
    }
}
```

**File**: `app/Http/Requests/Auth/RegisterRequest.php`

```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'regex:/^(\+212|0)[67]\d{8}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.min' => 'Name must be at least 2 characters',
            'email.required' => 'Email is required',
            'email.unique' => 'This email is already registered',
            'password.required' => 'Password is required',
            'password.confirmed' => 'Passwords do not match',
            'password.min' => 'Password must be at least 8 characters',
            'phone.regex' => 'Please provide a valid Moroccan phone number',
        ];
    }
}
```

### 4. Authentication Controllers

**File**: `app/Http/Controllers/Api/Auth/RegisterController.php`

```php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Hash;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            // Create user
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
                'phone' => $request->validated('phone'),
                'role' => 'customer', // Default role
                'status' => 'active',
            ]);

            // TODO: Send verification email in Phase 2
            // For Phase 1, auto-verify to allow login
            $user->update(['email_verified_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email to verify your account.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'email_verified_at' => $user->email_verified_at,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
```

**File**: `app/Http/Controllers/Api/Auth/LoginController.php`

```php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Hash;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Find user by email
            $user = User::where('email', $request->validated('email'))->first();

            // Check if user exists
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password',
                ], 401);
            }

            // Check password
            if (!Hash::check($request->validated('password'), $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password',
                ], 401);
            }

            // Check if email verified
            if (!$user->isVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please verify your email before logging in',
                ], 403);
            }

            // Check if account active
            if (!$user->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account is not active',
                ], 403);
            }

            // Create token
            $token = $user->createToken('api-token', ['*'])->plainTextToken;

            // Update last login
            $user->update(['last_login_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'status' => $user->status,
                        'email_verified_at' => $user->email_verified_at,
                    ],
                    'token' => $token,
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
```

**File**: `app/Http/Controllers/Api/Auth/LogoutController.php`

```php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    /**
     * Logout user and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
```

**File**: `app/Http/Controllers/Api/Auth/MeController.php`

```php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'avatar_path' => $user->avatar_path,
                'email_verified_at' => $user->email_verified_at,
                'last_login_at' => $user->last_login_at,
            ],
        ], 200);
    }
}
```

### 5. API Routes

**File**: `routes/api.php`

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\MeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Public auth routes (no authentication required)
    Route::prefix('auth')->group(function () {
        Route::post('register', [RegisterController::class, 'register'])->name('auth.register');
        Route::post('login', [LoginController::class, 'login'])->name('auth.login');
    });

    // Protected auth routes (authentication required)
    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('logout', [LogoutController::class, 'logout'])->name('auth.logout');
        Route::get('me', [MeController::class, 'me'])->name('auth.me');
    });
});
```

---

## FRONTEND IMPLEMENTATION (Next.js)

### 1. API Client Setup

**File**: `lib/api.ts`

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. Auth Utilities

**File**: `lib/auth.ts`

```typescript
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'seller' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  email_verified_at: string | null;
  avatar_path: string | null;
}

export const auth = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getUser: (): AuthUser | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  setUser: (user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },
};
```

### 3. Form Validators

**File**: `lib/validators.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string()
    .regex(/^(\+212|0)[67]\d{8}$/, 'Invalid Moroccan phone number')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### 4. Auth Hook

**File**: `lib/hooks/useAuth.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { auth, AuthUser } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = auth.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { user: userData, token } = response.data.data;

      // Store token and user
      auth.setToken(token);
      auth.setUser(userData);
      setUser(userData);

      // Redirect based on role
      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/customer');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/v1/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password,
        phone: data.phone || null,
      });

      // For Phase 1, auto-verify, so user can login immediately
      // Redirect to login page
      router.push('/login?registered=true');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API response
      auth.clearAuth();
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
}
```

### 5. Login Page

**File**: `app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const registered = searchParams.get('registered');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await login(data.email, data.password);
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MAADIN</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {registered && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            Registration successful! You can now login.
          </div>
        )}

        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

### 6. Register Page

**File**: `app/(auth)/register/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MAADIN</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {apiError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              {...register('name')}
              type="text"
              placeholder="John Doe"
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="+212 6xx xxx xxx"
              disabled={isSubmitting}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              {...register('passwordConfirm')}
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className={errors.passwordConfirm ? 'border-red-500' : ''}
            />
            {errors.passwordConfirm && (
              <p className="text-sm text-red-600 mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

---

## ENVIRONMENT SETUP

### Backend (.env)

```bash
APP_NAME=MAADIN
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=maadin_marketplace
DB_USERNAME=root
DB_PASSWORD=

# App Key
APP_KEY=base64:... # Run: php artisan key:generate

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## SETUP INSTRUCTIONS

### Backend Setup

```bash
# 1. Create Laravel project
composer create-project laravel/laravel maadin-backend

# 2. Install Sanctum
composer require laravel/sanctum

# 3. Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 4. Create migration
php artisan make:migration create_users_table

# 5. Copy the user migration file content (above)

# 6. Run migrations
php artisan migrate

# 7. Generate app key
php artisan key:generate

# 8. Create controllers
php artisan make:controller Api/Auth/RegisterController
php artisan make:controller Api/Auth/LoginController
php artisan make:controller Api/Auth/LogoutController
php artisan make:controller Api/Auth/MeController

# 9. Copy controller files (above)

# 10. Create request classes
php artisan make:request Auth/LoginRequest
php artisan make:request Auth/RegisterRequest

# 11. Copy request files (above)

# 12. Update routes/api.php (see above)

# 13. Start server
php artisan serve
```

### Frontend Setup

```bash
# 1. Create Next.js project
npx create-next-app@latest maadin-frontend --typescript --tailwind

# 2. Install dependencies
npm install axios react-hook-form @hookform/resolvers zod

# 3. Install Shadcn UI
npx shadcn-ui@latest init

# 4. Add UI components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card

# 5. Create directory structure
mkdir -p lib/hooks lib/hooks
mkdir -p app/\(auth\)/{login,register}
mkdir -p components/ui

# 6. Copy all files above

# 7. Update .env.local

# 8. Start dev server
npm run dev
```

---

## TESTING AUTH FLOW

### 1. Test Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+212612345678"
  }'
```

### 2. Test Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Test Protected Endpoint (Get Me)

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer {token_from_login}"
```

---

## ✅ CHECKLIST - Step 1 Complete When:

- [ ] User model created with roles (admin, seller, customer)
- [ ] Sanctum auth working
- [ ] Register endpoint works (/api/v1/auth/register)
- [ ] Login endpoint works (/api/v1/auth/login)
- [ ] Logout endpoint works (/api/v1/auth/logout)
- [ ] Get me endpoint works (/api/v1/auth/me)
- [ ] Frontend login page functional
- [ ] Frontend register page functional
- [ ] Token stored in localStorage
- [ ] User redirected to dashboard on login
- [ ] Logout clears token and redirects to login
- [ ] Password validation working (min 8 chars)
- [ ] Email validation working
- [ ] Moroccan phone validation working
- [ ] Error messages displaying correctly

---

## ⛔ NEXT STEPS

**STOP HERE**

Do NOT proceed to products, cart, or any other feature.

Wait for: **"Proceed to next step"**

Then we build **STEP 2: Product Listing (Public)**

---

**Status**: 🟡 AWAITING IMPLEMENTATION & TESTING
