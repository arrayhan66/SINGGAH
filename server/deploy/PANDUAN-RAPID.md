# Panduan Deploy Cepat — Siap Demo Besok

## Daftar langkah (browser saja, tanpa SSH)

| # | Platform | Yang kamu lakukan | Waktu |
|---|---|---|---|
| 1 | Railway | Sign up GitHub → **New Project** → pilih repo **SINGGAH** | 2 menit |
| 2 | Railway | Root Directory = `server`, Region = **Singapore** | |
| 3 | Railway | Paste env var di bawah → **Deploy** | 3 menit |
| 4 | Railway | Salin URL yang muncul (`xxx.up.railway.app`) | |
| 5 | Vercel | **Add New Project** → pilih repo **SINGGAH** | 2 menit |
| 6 | Vercel | Root Directory = `client`, Framework = **Vite** | |
| 7 | Vercel | Set `BACKEND_ORIGIN` = URL Railway → **Deploy** | 3 menit |
| 8 | Railway | Set `FRONTEND_URL` = URL Vercel → **Redeploy** | |

---

## Env var untuk Railway (salin langsung)

```
NODE_ENV=production
TRUST_PROXY=1
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_PORT=4000
FRONTEND_URL=https://XXX.vercel.app        <- isi SETELAH langkah 7
JWT_SECRET=<isi 48 karakter dari .env kamu>
CLOUDINARY_CLOUD_NAME=<dari .env>
CLOUDINARY_API_KEY=<dari .env>
CLOUDINARY_API_SECRET=<dari .env>
DB_HOST=<dari .env, contoh gateway01.ap-southeast-1.prod.aws...>
DB_USER=<dari .env>
DB_PASSWORD=<dari .env>
DB_NAME=<dari .env>
```

Yang **tidak perlu diisi**:
- `PORT` — Railway tentukan sendiri
- `DB_SSL` — aktif secara default (TiDB Cloud mewajibkan)
- `SERVER_BACKLOG` — default 8192 sudah aman
- `PM2_INSTANCES` — Railway pakai 1 worker, tidak relevan
- `REDIS_URL` — tidak usah, cache RAM sudah cukup untuk 40 pengguna

> `DB_SSL` dan `JWT_SECRET` adalah satu-satunya yang **harus** ada. Tanpa `JWT_SECRET`, login tidak bisa dilakukan.

---

## Yang wajib dicek sebelum demo

1. **Login berhasil** — buka `https://<domain-vercel>.vercel.app/login`, isi email/password yang valid. Kalau gagal, cek `JWT_SECRET` di Railway.
2. **Hall termuat** — buka halaman Hall di HP, tunggu 16 MB aset termuat (di Vercel CDN, mungkin 5–10 detik pertama kali).
3. **Uji beban real** — jalankan ini dari laptop ke URL Railway:
   ```bash
   cd server
   node tests/load/index.js --host=XXX.up.railway.app --users=40
   ```
   Harus **7/7 lolos**. Kalau gagal, ada yang perlu diperbaiki malam ini.

---

## Jika terjadi masalah

| Masalah | Penyebab & perbaikan |
|---|---|
| Login 401 padahal kredensial benar | `JWT_SECRET` salah atau kosong |
| Login 500 | `NODE_ENV` bukan `production`, atau `DB_SSL` tidak aktif |
| Semua endpoint 503 | Database tidak terhubung → cek `DB_HOST`, `DB_SSL` |
| Halaman loading terus | `BACKEND_ORIGIN` salah → perbaiki di Vercel env |
| Aset Hall tidak muncul | Vercel tidak deploy `client/public/` → pastikan root = `client` |
| Error 413 | File terlalu besar → turunkan kualitas video dulu |

---

## Catatan untuk hari presentasi

- Railway **tidak pernah tidur** (tidak ada cold start), jadi tidak perlu preload.
- Jika 40 orang buka bersamaan, server menangani dengan p95 < 200 ms.
- Kredital Railway $5 cukup untuk 30 hari demo — setelah itu platform akan naik ke paket berbayar atau mengurangi resource.
- Jika nanti butuh 1000+ concurrent, naikkan ke VPS. `deploy/` sudah punya script untuk itu.
