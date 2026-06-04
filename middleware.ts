import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Jalankan di edge runtime — sangat cepat, tidak ada cold start
  // Hanya cek cookie auth. Redirect ke login jika tidak ada sesi
  const token =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('sb-refresh-token')?.value ||
    // Supabase v2 cookie format
    [...request.cookies.getAll()].find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))?.value;

  const isAuthPage = request.nextUrl.pathname === '/';
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Jika tidak ada token dan mencoba masuk ke dashboard → ke halaman login
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Jika sudah punya token dan masih di halaman login → ke dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard/beranda', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
