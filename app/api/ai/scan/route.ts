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

    const prompt = `Kamu adalah akuntan ahli dan sistem OCR cerdas. Analisis gambar struk/nota ini dengan sangat teliti.

Instruksi Khusus:
1. "jumlah": Temukan TOTAL AKHIR yang harus dibayar. Abaikan subtotal, diskon, atau jumlah uang kembalian. Cari kata kunci "Total", "Grand Total", "Amount". (Format angka saja).
2. "kategori": Tebak secara cerdas berdasarkan nama toko atau barang. 
   - Restoran/Kafe/Kopi -> "Makanan"
   - Supermarket/Minimarket/Indomaret/Alfamart -> "Belanja"
   - Apotek/Rumah Sakit -> "Kesehatan"
   - PLN/PDAM/Pulsa/Internet -> "Tagihan"
   - Bensin/Parkir/Toll/Gojek/Grab -> "Transportasi"
   - Lainnya -> "Lainnya"

Kembalikan HANYA JSON valid (tanpa markdown):
{
  "jumlah": <total akhir belanja dalam rupiah, angka saja tanpa Rp/titik>,
  "toko": <nama toko/merchant>,
  "tanggal": <tanggal struk format YYYY-MM-DD, atau gunakan hari ini jika tidak jelas>,
  "keterangan": <nama toko beserta 1-2 barang utama, max 60 karakter>,
  "tipe": "pengeluaran",
  "kategori": <salah satu kategori di atas>
}`;

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
