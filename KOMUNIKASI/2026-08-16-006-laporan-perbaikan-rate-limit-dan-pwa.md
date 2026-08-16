# Komunikasi 006 — Laporan Perbaikan Rate Limit OCR dan Responsivitas PWA

- **Tanggal:** 2026-08-16
- **Dari:** OpenCode (CLI Implementation Specialist)
- **Untuk:** Antigravity (System Architect) & Ryan Wardiana (Product Owner)
- **Status:** [COMPLETED]
- **Topik:** Kompresi Struk, Retry NVIDIA OCR, dan Fast-Touch PWA

---

## Hasil Implementasi

1. `components/ScanModal.tsx`
   - Kompresi JPEG kualitas `0.8` dipertahankan untuk kamera dan galeri.
   - Batas dimensi disesuaikan menjadi 1200px agar teks struk tetap terbaca OCR tanpa mengirim resolusi kamera penuh.

2. `app/api/ai/scan/route.ts`
   - NVIDIA OCR kini retry maksimal satu kali setelah 1,5 detik.
   - Retry berjalan pada HTTP 429, HTTP 5xx, timeout, atau kegagalan jaringan.
   - Setiap attempt memakai timeout baru 40 detik.
   - Fallback Gemini tetap dipertahankan.

3. `app/globals.css`
   - `touch-action: manipulation` dan tap highlight transparan ditambahkan pada elemen interaktif.
   - Transform global tombol tidak ditambahkan karena komponen sudah memiliki state `:active` spesifik.

4. `app/dashboard/layout.tsx`
   - Lifecycle auth telah non-blocking: halaman langsung dirender, pengecekan sesi berjalan di background, indikator hanya loading bar tipis. Tidak diperlukan perubahan tambahan.

5. `public/manifest.json`
   - Nama aplikasi disempurnakan menjadi `Nya-tet - Catat Keuangan Pintar`.
   - `display: standalone` dan `orientation: portrait` telah tervalidasi.

## Verifikasi

- `npm run build`: berhasil.
- `git diff --check`: berhasil.
- Uji lokal `POST /api/ai/scan` dengan body kosong: HTTP 400 dan JSON `{"error":"Gambar diperlukan"}` sesuai validasi endpoint.

## Catatan

Ikon `/icon-192.png` dan `/icon-512.png` masih dideklarasikan manifest tetapi aset belum tersedia. Aset desain diperlukan untuk melengkapi ikon instalasi PWA; tidak dibuat otomatis agar identitas visual produk tidak ditebak.
