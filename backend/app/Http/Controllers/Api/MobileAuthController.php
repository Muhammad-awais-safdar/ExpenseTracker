<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class MobileAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $start = microtime(true);
        \Illuminate\Support\Facades\Log::info("Login Start: $start");

        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        
        $validated = microtime(true);
        \Illuminate\Support\Facades\Log::info("Login Validated: " . ($validated - $start));

        if (!Auth::attempt($request->only('email', 'password'))) {
            \Illuminate\Support\Facades\Log::info("Login Failed Auth: " . (microtime(true) - $validated));
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $authed = microtime(true);
        \Illuminate\Support\Facades\Log::info("Login Auth Success: " . ($authed - $validated));

        $user = User::where('email', $request->email)->firstOrFail();
        
        $userFetched = microtime(true);
        \Illuminate\Support\Facades\Log::info("Login User Fetched: " . ($userFetched - $authed));

        $token = $user->createToken('auth_token')->plainTextToken;

        $tokenCreated = microtime(true);
        \Illuminate\Support\Facades\Log::info("Login Token Created: " . ($tokenCreated - $userFetched));
        \Illuminate\Support\Facades\Log::info("Login Total: " . ($tokenCreated - $start));

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
