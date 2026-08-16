# 🤝 AGENTS.md — Protokol Kolaborasi Antigravity & OpenCode

Dokumen ini adalah acuan kerja bersama antara **Antigravity (System Architect & UI/UX Specialist)** dan **OpenCode (CLI Code Engine & Implementation Specialist)** yang dipimpin oleh **Ryan Wardiana (Product Owner & Lead Developer)**.

---

## 🎯 Pembagian Peran

| Agen / User | Peran Utama | Tanggung Jawab |
|---|---|---|
| 👤 **Ryan Wardiana** | *Product Owner & Final Decision Maker* | Menentukan kebutuhan fitur, arah desain, review fungsionalitas, dan keputusan final. |
| 🤖 **Antigravity** | *System Architect & UI/UX Specialist* | Merancang arsitektur sistem, desain UI/UX modern & responsive, spesifikasi teknis, pembuatan prompt/model AI, dan orkestrasi task. |
| ⚡ **OpenCode** | *CLI Code Engine & Implementation Specialist* | Eksekusi kode cepat di terminal, refactoring, debugging fungsionalitas, automasi build/linting, dan eksekusi command background. |

---

## 📁 Sistem Koordinasi: Folder `KOMUNIKASI/`

Semua catatan instruksi teknis, usulan fitur, dan laporan progress **WAJIB** dicatat dalam format file Markdown di direktori:
```text
KOMUNIKASI/
```

### Konvensi Penamaan File:
```text
YYYY-MM-DD-NNN-judul-topik-singkat.md
```
*Contoh:*
- `2026-08-16-001-protokol-kolaborasi-dan-sapaan-opencode.md`
- `2026-08-16-002-status-arsitektur-dan-roadmap-pengembangan.md`
- `2026-08-16-003-instruksi-perbaikan-fitur-x.md`
- `2026-08-16-004-laporan-progress-fitur-x.md`

---

## 🏷️ Label Status Komunikasi

- `[PROPOSED]` : Ide / konsep baru yang diusulkan.
- `[UNDER_REVIEW]` : Sedang ditinjau atau didiskusikan bersama Ryan.
- `[ACCEPTED]` : Telah disetujui resmi oleh Ryan.
- `[ACTION REQUIRED]` : Instruksi kerja siap dieksekusi oleh OpenCode atau Antigravity.
- `[PROGRESS]` : Sedang dalam tahap pengerjaan.
- `[COMPLETED]` : Telah selesai diimplementasikan, diuji, dan divalidasi.

---

## 🚀 Alur Kerja Kolaborasi (Workflow)

1. **Sebelum memulai sesi kerja:**
   - Baca `AGENTS.md` dan cek file terakhir di folder `KOMUNIKASI/` untuk mengetahui konteks dan tugas yang sedang berjalan.
2. **Saat memberikan instruksi kerja:**
   - Tulis spesifikasi target file, fungsi/baris yang diubah, dan contoh implementasi dengan status `[ACTION REQUIRED]`.
3. **Setelah menyelesaikan instruksi:**
   - Buat file laporan hasil dengan status `[COMPLETED]` atau `[PROGRESS]` agar agen lain dan Ryan mengetahui status kode terbaru.
