<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ActivityLogger;

class AuthController extends Controller
{
    /**
     * Login admin dan membuat token Sanctum.
     */
    public function login(Request $request)
    {
        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Mencoba Autentikasi
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            ActivityLogger::security('LOGIN_FAILED', [
                'email' => $request->email,
                'reason' => 'Invalid credentials'
            ]);

            return response()->json([
                'message' => 'Kredensial login tidak valid.'
            ], 401);
        }

        $token = $user->createToken('admin-token', ['*'], now()->addMinutes(config('sanctum.expiration')))->plainTextToken;

        // Log successful login
        ActivityLogger::auth('LOGIN_SUCCESS', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return response()->json([
            'message' => 'Login berhasil.',
            'user' => $user->only(['id', 'name', 'email']),
            'token' => $token,
            'token_expires_at' => now()->addMinutes(config('sanctum.expiration'))->timestamp
        ], 200);
    }

    /**
     * Logout admin dan menghapus token Sanctum.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Log logout
        ActivityLogger::auth('LOGOUT', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        // Menghapus token yang sedang digunakan
        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil. Token dihapus.'], 200);
    }
}

