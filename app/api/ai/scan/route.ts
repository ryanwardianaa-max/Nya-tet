import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Gambar diperlukan' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // Cek API Key
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      return NextResponse.json({ 
        error: 'Sistem AI belum dikonfigurasi (API Key hilang). Harap setel GEMINI_API_KEY di Vercel.' 
      }, { status: 400 });
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

    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text().trim();
    
    // Ambil JSON dari response (hilangkan markdown jika ada)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ ...parsed, _source: 'gemini' });
  } catch (err: any) {
    console.error('Scan AI error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memindai struk' }, { status: 500 });
  }
}
