# Checklist Deploy Vercel — SINGGAH

Frontend + API SINGGAH di-deploy ke **Vercel** (gratis, tanpa kartu kredit).
Satu fungsi serverless (`server/api/index.js`) melayani API **dan** menyajikan
frontend dari `client/dist` — jadi satu project cukup.

---

## 1. Sebelum mulai

- [ ] Kode sudah di-commit & di-push ke `main` (terakhir: siap deploy Vercel).
- [ ] Siapkan nilai rahasia dari `server/.env` dan `server/.env.cloudinary.bak`
      untuk diisi di Vercel (lihat langkah 3).

## 2. Import project ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Sign Up/Daftar** pakai akun GitHub
   (tidak ada kartu kredit diminta).
2. Klik **Add New…** → **Project**.
3. Import repository **`arrayhan66/SINGGAH`**.
4. Vercel otomatis membaca `vercel.json`:
   - **Build Command:** `cd client && npm install && npm run build`
   - **Output:** fungsi `server/api/index.js` (1 fungsi saja).
   Jangan ubah-ubah preset; biarkan sesuai `vercel.json`.
5. Klik **Deploy**. Boleh deploy dulu tanpa env — nanti deploy ulang setelah env diisi.

## 3. Isi Enviroment Variables

Di project → **Settings → Environment Variables** (untuk Production sekaligus
Build/Settings), isi:

| Nama | Nilai | Wajib? |
|---|---|---|
| `NODE_ENV` | `production` | wajib |
| `JWT_SECRET` | dari `.env` | wajib |
| `DB_HOST` | dari `.env` | wajib |
| `DB_PORT` | dari `.env` | wajib |
| `DB_NAME` | dari `.env` | wajib |
| `DB_USER` | dari `.env` | wajib |
| `DB_PASSWORD` | dari `.env` | wajib |
| `EMAIL_USER` | dari `.env` | wajib |
| `EMAIL_PASSWORD` | dari `.env` | wajib |
| `CLOUDINARY_CLOUD_NAME` | dari `.env.cloudinary.bak` | wajib |
| `CLOUDINARY_API_KEY` | dari `.env.cloudinary.bak` | wajib |
| `CLOUDINARY_API_SECRET` | dari `.env.cloudinary.bak` | wajib |
| `GOOGLE_CLIENT_ID` | dari `.env` | opsional |
| `VITE_GOOGLE_CLIENT_ID` | **sama dengan GOOGLE_CLIENT_ID** — dipakai saat build | opsional |

Catatan:
- `FRONTEND_URL` tidak perlu diisi — karena API & frontend satu asal (same-origin),
  CORS antara `/api` dan halaman tidak menjadi masalah.
- Setelah env diisi → **Redeploy** (Deployments → ⋯ → **Redeploy**).

## 4. Pastikan TiDB bisa diakses Vercel

- [ ] TiDB Cloud → Cluster → **Security → IP Access List** → pastikan ada
      **Allow All** (`0.0.0.0/0`) atau IP egress Vercel. Karena Vercel memakai
      banyak IP dinamis, paling praktis pakai Allow All untuk project dalam
      pengembangan.

## 5. Setelah deploy selesai

- [ ] Buka URL `https://<project>.vercel.app` → halaman SINGGAH tampil.
- [ ] Login admin → foto & media tampil (dari Cloudinary).
- [ ] Coba `/api/docs` — sengaja **tidak** aktif di production (perlindungan).
- [ ] Cek log di Vercel (**Project → Functions → Logs**) kalau ada error.

## 6. Batasan Vercel gratis yang perlu diketahui

- **Batas ukuran request ~4,5 MB.** Upload gambar biasa aman; upload video/dokumen
  besar (>4,5 MB) bisa gagal. Solusi kalau dibutuhkan: ubah alur upload agar browser
  langsung mengirim ke Cloudinary (direct upload) — bilang ke asistensi bila mau.
- **Cold start** beberapa ratus ms untuk fungsi pertama kali diakses — wajar.
- Medium/Pro tidak diperlukan untuk demo.

## 7. Rollback

- Vercel → tab **Deployments** → pilih deployment lama → **⋯ → Promote to Production**
  (atau **Redeploy**) untuk kembali ke versi sebelumnya.

## Catatan: Render (jika suatu saat punya kartu)

`render.yaml`, Dockerfile, dan `render-deploy-checklist.md` masih tersedia dan valid
kalau nanti mau pindah ke Render tanpa batasan 4,5 MB.