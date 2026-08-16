import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const CATEGORIES = ['Makanan', 'Minuman', 'Transport', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Transfer', 'Lainnya'];

const OCR_PROMPT = `Kamu adalah akuntan ahli dan sistem OCR cerdas. Analisis gambar struk/nota ini dengan sangat teliti.

Instruksi Khusus:
1. "jumlah": Temukan TOTAL AKHIR yang harus dibayar. Abaikan subtotal, diskon, atau jumlah uang kembalian. Cari kata kunci "Total", "Grand Total", "Amount", "Bayar". (Format angka integer bulat saja tanpa titik/koma/Rp).
2. "kategori": Tebak secara cerdas:
   - Restoran/Kafe/Kopi/Warung -> "Makanan"
   - Supermarket/Minimarket/Indomaret/Alfamart -> "Belanja"
   - Apotek/Rumah Sakit/Klinik -> "Kesehatan"
   - PLN/PDAM/Pulsa/Internet/Listrik -> "Tagihan"
   - Bensin/Parkir/Tol/Gojek/Grab -> "Transport"
   - Lainnya -> "Lainnya"

Kembalikan HANYA JSON valid (tanpa markdown dan tanpa teks lain):
{
  "jumlah": 0,
  "toko": "Nama Toko",
  "tanggal": "YYYY-MM-DD",
  "keterangan": "Nama toko beserta 1-2 barang utama",
  "tipe": "pengeluaran",
  "kategori": "Makanan"
}`;

export async function POST(request: NextRequest) {
  try {
    let imageBase64: string;

    try {
      const body = await request.json() as { imageBase64?: string };
      imageBase64 = body.imageBase64 || '';
    } catch {
      return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Gambar diperlukan' }, { status: 400 });
    }

    // Format Data URL
    const formattedDataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // ── 1. Coba NVIDIA NIM OCR (Primary) ──
    const nvidiaKey = process.env.NVIDIA_API_KEY?.trim();
    if (nvidiaKey) {
      try {
        const baseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
        const model = process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning';

        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${nvidiaKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: OCR_PROMPT },
                  { type: 'image_url', image_url: { url: formattedDataUrl } },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 2500,
          }),
          signal: AbortSignal.timeout(40_000),
        });

        if (res.ok) {
          const data = await res.json() as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const rawContent = data.choices?.[0]?.message?.content?.trim();
          if (rawContent) {
            const parsed = parseReceiptJSON(rawContent);
            return NextResponse.json({ ...parsed, _source: 'nvidia' });
          }
        } else {
          console.warn(`NVIDIA OCR HTTP ${res.status}:`, await res.text());
        }
      } catch (err) {
        console.error('NVIDIA OCR error:', err);
      }
    }

    // ── 2. Fallback ke Google Gemini jika ada key ──
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
      try {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent([
          OCR_PROMPT,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);

        const text = result.response.text().trim();
        const parsed = parseReceiptJSON(text);
        return NextResponse.json({ ...parsed, _source: 'gemini' });
      } catch (err) {
        console.error('Gemini OCR error:', err);
      }
    }

    return NextResponse.json({ error: 'Tidak dapat memproses gambar struk. Harap periksa konfigurasi API Key.' }, { status: 500 });
  } catch (err: unknown) {
    console.error('Scan AI handler error:', err);
    return NextResponse.json({ error: 'Gagal memindai struk' }, { status: 500 });
  }
}

function parseReceiptJSON(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  const rawAmount = String(parsed.jumlah ?? '').replace(/[^\d]/g, '');

  return {
    jumlah: Math.abs(Number.parseInt(rawAmount, 10)) || 0,
    toko: typeof parsed.toko === 'string' ? parsed.toko.slice(0, 50) : 'Toko',
    tanggal: typeof parsed.tanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.tanggal)
      ? parsed.tanggal
      : new Date().toISOString().split('T')[0],
    keterangan: typeof parsed.keterangan === 'string' && parsed.keterangan.trim()
      ? parsed.keterangan.trim().slice(0, 100)
      : 'Belanja',
    tipe: 'pengeluaran',
    kategori: typeof parsed.kategori === 'string' && CATEGORIES.includes(parsed.kategori)
      ? parsed.kategori
      : 'Belanja',
  };
}
