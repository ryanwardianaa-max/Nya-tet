# 🚀 Komunikasi 002 — Instruksi Integrasi API Xkiro (DeepSeek V4 Pro)

- **Tanggal:** 2026-08-16
- **Dari:** Antigravity (System Architect)
- **Untuk:** OpenCode (CLI Code Engine) & Ryan Wardiana (Product Owner)
- **Status:** [ACTION REQUIRED]
- **Topik:** Integrasi AI Voice & OCR Transaksi menggunakan Provider Xkiro (DeepSeek V4 Pro)

---

## 1. Latar Belakang & Hasil Pengujian API
Endpoint Xkiro telah diuji dan **berhasil 100% (HTTP 200 OK)** dengan latency yang sangat cepat dan parsing JSON yang akurat.

### Kredensial & Spesifikasi API:
- **Provider:** Xkiro (`xkiro`)
- **API Type:** OpenAI Compatible (`/v1/chat/completions`)
- **Base URL:** `https://api.xkiro.com/v1`
- **Model ID:** `deepseek/deepseek-v4-pro`
- **API Key:** `process.env.XKIRO_API_KEY` (Tersimpan di .env.local)

---

## 2. Rincian Pekerjaan Teknis (Tasks for OpenCode)

### Task 1: Update File `.env.local`
Tambahkan konfigurasi berikut ke `.env.local`:
```env
XKIRO_API_KEY=your-xkiro-api-key
XKIRO_BASE_URL=https://api.xkiro.com/v1
XKIRO_MODEL=deepseek/deepseek-v4-pro
```

### Task 2: Modifikasi `app/api/ai/voice/route.ts`
Implementasikan parser AI berbasis Xkiro DeepSeek V4 Pro sebagai **Primary AI Engine** dengan struktur:
1. Panggil `https://api.xkiro.com/v1/chat/completions` menggunakan `model: "deepseek/deepseek-v4-pro"`.
2. Gunakan System Prompt ekstraksi transaksi keuangan (jumlah, tipe, kategori, keterangan) dengan respon murni JSON.
3. Buat mekanisme fallback bertingkat:
   - **Level 1 (Primary):** Xkiro DeepSeek V4 Pro.
   - **Level 2 (Secondary Fallback):** Google Gemini API (jika ada GEMINI_API_KEY).
   - **Level 3 (Tertiary Fallback):** `parseManual` (Regex).

Contoh implementasi pemanggilan Xkiro:
```typescript
const response = await fetch(`${process.env.XKIRO_BASE_URL || 'https://api.xkiro.com/v1'}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.XKIRO_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.XKIRO_MODEL || 'deepseek/deepseek-v4-pro',
    messages: [
      {
        role: 'system',
        content: `Ekstrak transaksi keuangan dari teks bahasa Indonesia menjadi JSON murni tanpa markdown:
{
  "jumlah": <angka integer bulat>,
  "tipe": <"pemasukan" atau "pengeluaran">,
  "kategori": <"Makanan" | "Minuman" | "Transport" | "Belanja" | "Hiburan" | "Kesehatan" | "Tagihan" | "Pemasukan" | "Transfer" | "Lainnya">,
  "keterangan": <string ringkas>
}`
      },
      {
        role: 'user',
        content: transcript
      }
    ],
    temperature: 0.1
  })
});
```

### Task 3: Pengujian & Laporan
1. Jalankan pengujian request ke API voice (misal `POST /api/ai/voice` dengan body `{"transcript": "Kemarin bayar makan siang 45 ribu di warteg"}`).
2. Pastikan dev server merespons JSON dengan benar.
3. Buat file laporan hasil di `KOMUNIKASI/2026-08-16-003-laporan-integrasi-api-xkiro.md` dengan status `[COMPLETED]`.

---

Instruksi ini siap dieksekusi oleh **OpenCode**! ⚡
