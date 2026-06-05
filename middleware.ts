import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Jalankan di edge runtime — sangat cepat, tidak ada cold start
  // Aplikasi menggunakan Local Storage (bukan Cookies) untuk sesi Supabase.
  // Oleh karena itu, kita biarkan halaman klien yang menangani proteksi rute (seperti sebelumnya).
  // Middleware berbasis cookie ini dinonaktifkan agar tidak terjadi infinite loop.

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
