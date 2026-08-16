# 📋 Komunikasi 005 — Instruksi Perbaikan Rate Limit OCR & Responsivitas PWA Mobile

- **Tanggal:** 2026-08-16
- **Dari:** Antigravity (System Architect)
- **Untuk:** OpenCode (CLI Implementation Specialist) & Ryan Wardiana (Product Owner)
- **Status:** [ACTION REQUIRED]
- **Topik:**
  1. Penanganan Rate-Limit & Kompresi Foto Struk pada NVIDIA OCR
  2. Optimasi Responsivitas Touch / Fast-Click pada PWA Mobile di Beranda HP

---

## 🔍 Analisis Masalah

### 1. Masalah OCR Gagal Saat 2 Kali Berturut-turut
- **Penyebab:**
  - Foto dari kamera HP berukuran sangat besar (3MB - 8MB base64), membebani jaringan dan menyebabkan serverless function timeout.
  - Endpoint NVIDIA NIM memiliki batas antrian (*burst rate limit*). Jika 2 request dikirimkan berurutan, request kedua berisiko terkena delay atau HTTP 429.
- **Solusi:**
  - Tambahkan kompresi gambar otomatis di sisi klien (`ScanModal.tsx`) sebelum dikirim ke server (resize max 1280px, quality 0.8 JPEG). Ukuran berkurang dari 5MB menjadi ~250KB (15x lebih cepat!).
  - Tambahkan auto-retry logic dengan jeda 1.5 detik di backend `app/api/ai/scan/route.ts` jika respons pertama gagal.

### 2. Masalah PWA di Beranda HP Tidak Responsif (Harus Diklik 5 Kali)
- **Penyebab:**
  - Mobile browser default menambahkan *300ms touch delay* pada event klik jika tidak ada aturan CSS `touch-action: manipulation`.
  - PWA di HP mengalami freeze ringan saat inisialisasi sesi `supabase.auth.getSession()` jika state blocking belum selesai.
- **Solusi:**
  - Tambahkan optimasi CSS fast-touch di `app/globals.css`.
  - Optimalkan lifecycle pengecekan auth di `app/dashboard/layout.tsx` agar non-blocking.
  - Sempurnakan `public/manifest.json` dengan `display: "standalone"` dan `orientation: "portrait"`.

---

## 🛠️ Rincian Tugas untuk OpenCode

### Task 1: Kompresi Gambar Klien di `components/ScanModal.tsx`
Pastikan fungsi `compressImage` di `ScanModal.tsx` mengecilkan gambar sebelum diproses:
```typescript
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
```

### Task 2: Auto-Retry & Error Handling di `app/api/ai/scan/route.ts`
Perbarui pemanggilan NVIDIA OCR dengan 1x retry jika mengalami timeout atau rate limit:
```typescript
let res = await fetch(`${baseUrl}/chat/completions`, fetchOptions);

// Auto-retry 1x jika status 429 atau 500
if (!res.ok && (res.status === 429 || res.status >= 500)) {
  await new Promise((r) => setTimeout(r, 1500));
  res = await fetch(`${baseUrl}/chat/completions`, fetchOptions);
}
```

### Task 3: Fast-Touch & Mobile Performance di `app/globals.css`
Tambahkan aturan berikut pada `app/globals.css`:
```css
/* ── Mobile & PWA Fast-Touch Optimization ── */
* {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

button, a, input, select {
  touch-action: manipulation;
}

/* Hilangkan delay tap pada tombol */
button:active {
  transform: scale(0.98);
  transition: transform 0.08s ease;
}
```

### Task 4: Sempurnakan `public/manifest.json`
Pastikan `public/manifest.json` memiliki:
```json
{
  "name": "Nya-tet - Catat Keuangan Pintar",
  "short_name": "Nya-tet",
  "start_url": "/dashboard/beranda",
  "display": "standalone",
  "background_color": "#f5f5f7",
  "theme_color": "#ffffff",
  "orientation": "portrait"
}
```

### Task 5: Build, Test, & Push
1. Uji endpoint secara lokal.
2. Lakukan `git add .`, `git commit -m "perf: kompresi foto struk, retry handler ocr, dan optimasi responsivitas pwa mobile"`, lalu `git push origin main`.
3. Laporkan hasilnya di `KOMUNIKASI/2026-08-16-006-laporan-perbaikan-rate-limit-dan-pwa.md` dengan status `[COMPLETED]`.
