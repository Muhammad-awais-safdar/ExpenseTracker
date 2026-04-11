<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;

class MobileAuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $this->seedDefaultCategories($user);

        $token = $user->createToken($validated['device_name'] ?? 'auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials provided.'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        
        $token = $user->createToken($request->device_name ?? 'auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    private function seedDefaultCategories($user)
    {
        $categories = [
            ['name' => 'Food', 'type' => 'expense', 'icon' => 'fast-food', 'color' => '#FF5733'],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'bus', 'color' => '#33FF57'],
            ['name' => 'Utilities', 'type' => 'expense', 'icon' => 'flash', 'color' => '#3357FF'],
            ['name' => 'Rent', 'type' => 'expense', 'icon' => 'home', 'color' => '#F3FF33'],
            ['name' => 'Health', 'type' => 'expense', 'icon' => 'medkit', 'color' => '#FF33F3'],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => 'cart', 'color' => '#25b917'],
            ['name' => 'Salary', 'type' => 'income', 'icon' => 'cash', 'color' => '#33FFF3'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => 'laptop', 'color' => '#33FF33'],
            ['name' => 'Gift', 'type' => 'income', 'icon' => 'gift', 'color' => '#FF3333'],
        ];

        foreach ($categories as $cat) {
            $user->categories()->create($cat);
        }
    }
}
