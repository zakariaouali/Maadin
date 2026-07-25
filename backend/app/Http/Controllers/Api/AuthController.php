<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function __construct(private ImageService $images) {}
    // REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => ['required', 'string', Password::min(8)],
            'phone'    => 'nullable|string|max:20',
            'role'     => 'nullable|in:customer,seller',
            'plan'     => 'nullable|in:starter,managed,premium',
        ]);

        $role = $request->role ?? 'customer';

        $locale = $request->header('X-Locale');
        $locale = in_array($locale, ['en', 'fr', 'ar']) ? $locale : 'en';

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => $role,
            'plan'     => $role === 'seller' ? ($request->plan ?? 'starter') : 'starter',
            'status'   => 'active',
            'locale'   => $locale,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user]);
    }

    // LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        if ($user->status === 'banned') {
            Auth::logout();
            return response()->json(['message' => 'Account has been banned'], 403);
        }

        if ($user->status === 'suspended') {
            Auth::logout();
            return response()->json(['message' => 'Account has been suspended'], 403);
        }

        $request->session()->regenerate();
        $updateData = ['last_login_at' => now()];
        $locale = $request->header('X-Locale') ?? $request->input('locale');
        if ($locale && in_array($locale, ['en', 'fr', 'ar'])) {
            $updateData['locale'] = $locale;
        }
        $user->update($updateData);

        return response()->json(['user' => $user]);
    }

    // ME
    public function me(Request $request)
    {
        return response()->json($request->user()->fresh());
    }

    // UPDATE PROFILE (name, phone, avatar)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'phone'      => 'nullable|string|max:20',
            'avatar_url' => 'nullable|string|url|max:1000',
            'avatar'     => 'sometimes|nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif|max:2048',
        ]);

        $data = collect($validated)->except(['avatar', 'avatar_url'])->toArray();

        if ($request->filled('avatar_url')) {
            $data['avatar_path'] = $validated['avatar_url'];
        } elseif ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                $this->images->delete($user->avatar_path);
            }
            $data['avatar_path'] = $this->images->upload($request->file('avatar'), 'avatars');
        }

        $user->update($data);

        return response()->json($user->fresh());
    }

    // CHANGE PASSWORD
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        if (!\Hash::check($request->current_password, $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
        }

        $user->update(['password' => \Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated.']);
    }

    // FORGOT PASSWORD — sends reset link via email
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No account found with this email address.'], 404);
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->upsert(
            ['email' => $user->email, 'token' => Hash::make($token), 'created_at' => now()],
            ['email'],
            ['token', 'created_at']
        );

        $resetUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000'))
            . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        Mail::to($user->email)->send(new PasswordResetMail($user->name, $resetUrl, $user->locale ?? 'en'));

        return response()->json(['message' => 'If an account exists, a reset link has been sent.']);
    }

    // RESET PASSWORD
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'                 => 'required|string',
            'email'                 => 'required|email',
            'password'              => ['required', 'string', Password::min(8), 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Reset token has expired.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}