import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CATEGORIES = ['Makanan', 'Minuman', 'Transport', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Pemasukan', 'Transfer', 'Lainnya'];

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'Transkripsi kosong' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // ── Gunakan Gemini real jika ada key ──
  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Ekstrak informasi transaksi keuangan dari teks berikut dalam Bahasa Indonesia.

Teks: "${transcript}"

Jawab dalam JSON dengan format PERSIS seperti ini (tidak ada teks lain):
{
  "jumlah": <angka bulat murni, misal: 25000. JANGAN gunakan titik/koma/simbol/huruf>,
  "tipe": "<"pemasukan" atau "pengeluaran">,
  "kategori": "<salah satu dari: ${CATEGORIES.join(', ')}>",
  "keterangan": "<deskripsi singkat>"
}

Aturan:
- WAJIB konversi kata menjadi angka nol penuh (misal: "25 ribu" -> 25000, "1 setengah juta" -> 1500000)
- Hilangkan teks harga pada keterangan (misal "Beli kopi rp25.000" -> keterangan: "Beli kopi")
- Jika menyebut "beli", "bayar", "makan", "minum" -> tipe = pengeluaran
- Jika menyebut "gaji", "terima", "dapat", "pemasukan" -> tipe = pemasukan`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Ambil JSON dari response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        jumlah: Math.abs(parseInt(String(parsed.jumlah).replace(/\D/g, ''), 10)) || 0,
        tipe: parsed.tipe === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
        kategori: CATEGORIES.includes(parsed.kategori) ? parsed.kategori : 'Lainnya',
        keterangan: String(parsed.keterangan || transcript.slice(0, 50)),
      });
    } catch (err) {
      console.error('Gemini error:', err);
      // Fallback ke parsing manual
    }
  }

  // ── Fallback: parsing manual ──
  return NextResponse.json(parseManual(transcript));
}

function parseManual(text: string) {
  const lower = text.toLowerCase();

  // Bersihkan titik (.) jika dipakai sebagai pemisah ribuan (misal: 25.000 -> 25000)
  const cleanedText = lower.replace(/rp/g, '').replace(/\./g, '');
  
  // Ekstrak angka
  let jumlah = 0;
  const patterns = [
    { re: /(\d+(?:,\d+)?)\s*juta/, mult: 1_000_000 },
    { re: /(\d+(?:,\d+)?)\s*ratus\s*ribu/, mult: 100_000 },
    { re: /(\d+(?:,\d+)?)\s*ribu/, mult: 1_000 },
    { re: /(\d+(?:,\d+)?)\s*rb/, mult: 1_000 },
    { re: /(\d{4,})/, mult: 1 },
    { re: /(\d+)/, mult: 1000 }, // asumsi jika cuma "25" maksudnya "25000" dalam konteks uang
  ];
  
  for (const { re, mult } of patterns) {
    const m = cleanedText.match(re);
    if (m) {
      jumlah = Math.round(parseFloat(m[1].replace(',', '.')) * mult);
      if (jumlah >= 1000) break; // Hanya ambil yang masuk akal
    }
  }

  // Tipe
  const isIncome = /gaji|terima|dapat|masuk|pemasukan|penghasilan|transfer masuk/.test(lower);
  const tipe: 'pemasukan' | 'pengeluaran' = isIncome ? 'pemasukan' : 'pengeluaran';

  // Kategori
  let kategori = 'Lainnya';
  if (/makan|minum|kopi|nasi|bakso|mie|warung|restoran|café/.test(lower)) kategori = 'Makanan';
  else if (/bensin|grab|ojek|gojek|taxi|angkot|parkir|tol|bus|kereta/.test(lower)) kategori = 'Transport';
  else if (/belanja|beli|toko|mall|supermarket|shopee|tokopedia/.test(lower)) kategori = 'Belanja';
  else if (/listrik|air|internet|pulsa|tagihan|iuran/.test(lower)) kategori = 'Tagihan';
  else if (/dokter|obat|apotek|klinik|rumah sakit/.test(lower)) kategori = 'Kesehatan';
  else if (/bioskop|netflix|game|hiburan|nonton/.test(lower)) kategori = 'Hiburan';
  else if (isIncome) kategori = 'Pemasukan';

  return {
    jumlah,
    tipe,
    kategori,
    keterangan: text.length > 50 ? text.slice(0, 50) + '...' : text,
  };
}
