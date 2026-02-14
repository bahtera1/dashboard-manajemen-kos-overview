<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 * 
 * Menambahkan security headers pada setiap response untuk meningkatkan keamanan aplikasi.
 * Headers ini membantu melindungi dari berbagai serangan umum seperti XSS, Clickjacking, dll.
 */
class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Mencegah Clickjacking - browser tidak boleh menampilkan halaman dalam iframe
        $response->headers->set('X-Frame-Options', 'DENY');

        // Mencegah MIME type sniffing - browser harus mengikuti Content-Type yang diberikan
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Mengaktifkan XSS filter pada browser lama
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Mengontrol informasi referrer yang dikirim saat navigasi
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Mencegah browser dari caching data sensitif
        // Hanya untuk API responses, bukan untuk assets statis
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
        }

        // Content Security Policy - membatasi sumber konten yang diizinkan
        // Untuk API, kita set minimal karena tidak ada HTML rendering
        if ($request->is('api/*')) {
            $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
        }

        // Strict Transport Security - memaksa HTTPS (hanya di production)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Permissions Policy - membatasi akses ke fitur browser
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        return $response;
    }
}
