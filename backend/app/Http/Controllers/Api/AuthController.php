<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'role'     => $role,
            'plan'     => $role === 'seller' ? ($request->plan ?? 'starter') : 'starter',
            'status'   => 'active',
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
        $user->update(['last_login_at' => now()]);

        return response()->json(['user' => $user]);
    }

    // ME (TEST AUTH)
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // UPDATE PROFILE (name, phone, avatar)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'   => 'sometimes|required|string|max:255',
            'phone'  => 'nullable|string|max:20',
            'avatar' => 'sometimes|nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif|max:2048',
        ]);

        $data = collect($validated)->except('avatar')->toArray();

        if ($request->hasFile('avatar')) {
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

    // LOGOUT
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out']);
    }
}