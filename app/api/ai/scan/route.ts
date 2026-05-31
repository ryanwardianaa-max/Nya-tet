import { NextRequest, NextResponse } from 'next/server';

const MOCK_SCAN_RESPONSE = {
  jumlah: 89500,
  toko: 'Indomaret',
  tanggal: new Date().toISOString().split('T')[0],
  keterangan: 'Belanja di Indomaret',
  tipe: 'pengeluaran' as const,
  kategori: 'Belanja',
};

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Gambar diperlukan' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key, use mock
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return NextResponse.json({
        ...MOCK_SCAN_RESPONSE,
        _source: 'mock',
        _note: 'Tambahkan GEMINI_API_KEY di .env.local untuk AI sungguhan',
      });
    }

    const prompt = `Kamu adalah sistem OCR untuk struk belanja. Analisis gambar struk/nota ini.

Kembalikan HANYA JSON valid (tanpa markdown):
{
  "jumlah": <total belanja dalam rupiah, angka saja>,
  "toko": <nama toko/merchant>,
  "tanggal": <tanggal dalam format YYYY-MM-DD, atau null>,
  "keterangan": <deskripsi singkat max 60 karakter>,
  "tipe": "pengeluaran",
  "kategori": <"Makanan", "Belanja", "Kesehatan", "Tagihan", atau "Lainnya">
}

Jika tidak bisa membaca dengan jelas, gunakan nilai terbaik yang bisa diestimasi.`;

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ ...MOCK_SCAN_RESPONSE, _source: 'mock_fallback' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json({ ...parsed, _source: 'gemini' });
  } catch (err) {
    console.error('Scan AI error:', err);
    return NextResponse.json({ error: 'Gagal memindai struk' }, { status: 500 });
  }
}
