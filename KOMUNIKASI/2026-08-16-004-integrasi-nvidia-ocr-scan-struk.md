# 📸 Komunikasi 004 — Integrasi NVIDIA OCR untuk Fitur Scan Struk

- **Tanggal:** 2026-08-16
- **Dari:** Antigravity & OpenCode
- **Untuk:** Ryan Wardiana (Product Owner)
- **Status:** [COMPLETED]
- **Topik:** Penggantian Engine Scan Struk / OCR ke NVIDIA NIM (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`)

---

## 1. Ringkasan Eksekusi

Engine **Scan Struk / Mode Foto** (`POST /api/ai/scan`) telah berhasil dimigrasikan dari Gemini ke **NVIDIA OCR (NVIDIA NIM Omni Reasoning)**!

### Kredensial & Spesifikasi:
- **Provider:** NVIDIA NIM
- **Base URL:** `https://integrate.api.nvidia.com/v1`
- **Model ID:** `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- **Kemampuan:** Multimodal Vision OCR + Reasoning (HTTP 200 OK pada pengujian gambar nota).

---

## 2. Arsitektur Dual AI Engine Nya-tet:

1. 🎙️ **Voice / Suara:**
   - **Engine:** **Xkiro (DeepSeek V4 Pro)**
   - **Karakteristik:** Sangat cepat untuk ekstraksi teks percakapan & nominal transaksi.

2. 📸 **Foto / Scan Struk:**
   - **Engine:** **NVIDIA NIM OCR (`nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`)**
   - **Karakteristik:** Membaca gambar struk/nota belanja secara cerdas dan menghasilkan data JSON (Toko, Tanggal, Nominal, Kategori).

---

## 3. Langkah Konfigurasi di Vercel:

Tambahkan variabel berikut di dashboard **Vercel Settings $\rightarrow$ Environment Variables**:
- `NVIDIA_API_KEY` = `process.env.NVIDIA_API_KEY`
- `NVIDIA_BASE_URL` = `https://integrate.api.nvidia.com/v1`
- `NVIDIA_MODEL` = `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- `XKIRO_API_KEY` = `process.env.XKIRO_API_KEY`
- `XKIRO_BASE_URL` = `https://api.xkiro.com/v1`
- `XKIRO_MODEL` = `deepseek/deepseek-v4-pro`
