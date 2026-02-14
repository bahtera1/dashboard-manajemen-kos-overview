<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

/**
 * Activity Logger Helper
 * 
 * Helper class untuk logging aktivitas penting dalam aplikasi.
 * Logs disimpan ke channel 'activity' yang terpisah dari log default.
 */
class ActivityLogger
{
    /**
     * Log aktivitas user (login, logout, dll)
     */
    public static function auth(string $action, array $context = []): void
    {
        $data = array_merge([
            'action' => $action,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toDateTimeString(),
        ], $context);

        Log::channel('activity')->info("[AUTH] {$action}", $data);
    }

    /**
     * Log aktivitas CRUD pada resource
     */
    public static function resource(string $resource, string $action, $id = null, array $context = []): void
    {
        $user = Auth::user();

        $data = array_merge([
            'resource' => $resource,
            'action' => $action,
            'resource_id' => $id,
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'ip' => request()->ip(),
            'timestamp' => now()->toDateTimeString(),
        ], $context);

        Log::channel('activity')->info("[{$resource}] {$action}", $data);
    }

    /**
     * Log transaksi keuangan (untuk audit trail)
     */
    public static function transaction(string $action, $transaksiId, float $jumlah, array $context = []): void
    {
        $user = Auth::user();

        $data = array_merge([
            'action' => $action,
            'transaksi_id' => $transaksiId,
            'jumlah' => $jumlah,
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'ip' => request()->ip(),
            'timestamp' => now()->toDateTimeString(),
        ], $context);

        Log::channel('activity')->info("[TRANSAKSI] {$action}", $data);
    }

    /**
     * Log error dengan context lengkap
     */
    public static function error(string $message, \Throwable $exception, array $context = []): void
    {
        $user = Auth::user();

        $data = array_merge([
            'message' => $message,
            'exception' => get_class($exception),
            'error_message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'user_id' => $user?->id,
            'ip' => request()->ip(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toDateTimeString(),
        ], $context);

        Log::channel('activity')->error("[ERROR] {$message}", $data);
    }

    /**
     * Log security event (failed login, suspicious activity, dll)
     */
    public static function security(string $event, array $context = []): void
    {
        $data = array_merge([
            'event' => $event,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'url' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toDateTimeString(),
        ], $context);

        Log::channel('activity')->warning("[SECURITY] {$event}", $data);
    }
}
