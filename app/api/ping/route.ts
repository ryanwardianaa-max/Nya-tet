import { NextResponse } from 'next/server';

// Endpoint ini dipanggil otomatis oleh browser di background via Service Worker
// untuk menjaga Supabase dan Vercel tetap "hangat" (tidak tidur)
export async function GET() {
  try {
    // Ping ke Supabase untuk mencegahnya pause
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        // Timeout cepat — kita hanya peduli agar koneksi hidup
        signal: AbortSignal.timeout(5000),
      }).catch(() => {}); // Abaikan error
    }
  } catch {
    // Abaikan semua error — ini hanya keep-alive
  }

  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}
