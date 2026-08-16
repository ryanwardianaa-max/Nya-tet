import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CATEGORIES = ['Makanan', 'Minuman', 'Transport', 'Belanja', 'Hiburan', 'Kesehatan', 'Tagihan', 'Pemasukan', 'Transfer', 'Lainnya'];
const SYSTEM_PROMPT = `Ekstrak transaksi keuangan dari teks bahasa Indonesia menjadi JSON murni tanpa markdown:
{
  "jumlah": <angka integer bulat>,
  "tipe": <"pemasukan" atau "pengeluaran">,
  "kategori": <"Makanan" | "Minuman" | "Transport" | "Belanja" | "Hiburan" | "Kesehatan" | "Tagihan" | "Pemasukan" | "Transfer" | "Lainnya">,
  "keterangan": <string ringkas>
}
Konversi nominal seperti "45 ribu" menjadi 45000. Hilangkan nominal dari keterangan.`;

export async function POST(req: NextRequest) {
  let transcript: string;

  try {
    const body: unknown = await req.json();
    transcript = typeof body === 'object' && body !== null && 'transcript' in body
      ? String((body as { transcript?: unknown }).transcript ?? '').trim()
      : '';
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 });
  }

  if (!transcript) {
    return NextResponse.json({ error: 'Transkripsi kosong' }, { status: 400 });
  }

  const xkiroKey = process.env.XKIRO_API_KEY?.trim();
  if (xkiroKey) {
    try {
      const baseUrl = (process.env.XKIRO_BASE_URL || 'https://api.xkiro.com/v1').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${xkiroKey}`,
        },
        body: JSON.stringify({
          model: process.env.XKIRO_MODEL || 'deepseek/deepseek-v4-pro',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: transcript },
          ],
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Respons Xkiro kosong');

      return NextResponse.json(parseAIResponse(content, transcript));
    } catch (err) {
      console.error('Xkiro error:', err);
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nTeks: ${transcript}`);
      return NextResponse.json(parseAIResponse(result.response.text(), transcript));
    } catch (err) {
      console.error('Gemini error:', err);
    }
  }

  return NextResponse.json(parseManual(transcript));
}

function parseAIResponse(text: string, transcript: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Respons AI tidak memuat JSON');

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  const rawAmount = String(parsed.jumlah ?? '').replace(/[^\d]/g, '');

  return {
    jumlah: Math.abs(Number.parseInt(rawAmount, 10)) || 0,
    tipe: parsed.tipe === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
    kategori: typeof parsed.kategori === 'string' && CATEGORIES.includes(parsed.kategori)
      ? parsed.kategori
      : 'Lainnya',
    keterangan: typeof parsed.keterangan === 'string' && parsed.keterangan.trim()
      ? parsed.keterangan.trim().slice(0, 100)
      : transcript.slice(0, 100),
  };
}

function parseManual(text: string) {
  const lower = text.toLowerCase();
  const cleanedText = lower.replace(/rp/g, '').replace(/\./g, '');

  let jumlah = 0;
  const patterns = [
    { re: /(\d+(?:,\d+)?)\s*juta/, mult: 1_000_000 },
    { re: /(\d+(?:,\d+)?)\s*ratus\s*ribu/, mult: 100_000 },
    { re: /(\d+(?:,\d+)?)\s*ribu/, mult: 1_000 },
    { re: /(\d+(?:,\d+)?)\s*rb/, mult: 1_000 },
    { re: /(\d{4,})/, mult: 1 },
    { re: /(\d+)/, mult: 1000 },
  ];

  for (const { re, mult } of patterns) {
    const match = cleanedText.match(re);
    if (match) {
      jumlah = Math.round(Number.parseFloat(match[1].replace(',', '.')) * mult);
      if (jumlah >= 1000) break;
    }
  }

  const isIncome = /gaji|terima|dapat|masuk|pemasukan|penghasilan|transfer masuk/.test(lower);
  const tipe: 'pemasukan' | 'pengeluaran' = isIncome ? 'pemasukan' : 'pengeluaran';

  let kategori = 'Lainnya';
  if (/makan|minum|kopi|nasi|bakso|mie|warung|warteg|restoran|café/.test(lower)) kategori = 'Makanan';
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
    keterangan: text.length > 50 ? `${text.slice(0, 50)}...` : text,
  };
}
