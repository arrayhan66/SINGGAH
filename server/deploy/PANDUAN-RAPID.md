# Panduan Deploy Lengkap — Website SINGGAH (Demo Besok)

## Target

Website berjalan online bagi **40+ orang**, bisa diakses dari HP/Laptop tanpa install apa pun, melalui browser.

## Arsitektur yang dipilih

```
Pengunjung (HP/Laptop)
        │
        ▼
  Vercel (frontend React + CDN)     ← GRATIS, domain .vercel.app
        │  rewrite /api ──────────►
  Railway (backend Express)          ← GRATIS, $5 kredit 30 hari,
        │                            tidak pernah tidur (tanpa cold start)
        ▼
  TiDB Cloud (database)              ← sudah ada
```

Alasan memilih ini:
- **Tidak perlu domain** — Vercel dan Railway kasih subdomain gratis
- **Tidak perlu SSH** — semua di klik di browser
- **Tidak perlu kartu kredit** — Railway free trial $5, 30 hari
- **Tidak ada cold start** — Railway tidak pernah mematikan service (beda Render free yang tidur 15 menit)
- **40 orang sangat aman** — tes simulasi 40 orang menghasilkan p95 < 151 ms, 0 error

---

## PRASYARAT (siapkan SEBELUM mulai)

### 1. Pastikan kamu punya 3 akun
- [ ] **GitHub** — sudah punya (repo SINGGAH sudah di sini)
- [ ] **Railway** — buka [railway.com](https://railway.com), klik "Continue with GitHub"
- [ ] **Vercel** — buka [vercel.com](https://vercel.com), klik "Continue with GitHub"

### 2. Catat semua nilai env dari .env lokalmu

Buka `server/.env` di VS Code. Catat (salin ke Notepad/telepon) nilai-nilai ini:

| Variabel | Contoh isi |
|---|---|
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws...` |
| `DB_PORT` | `4000` |
| `DB_USER` | (isi) |
| `DB_PASSWORD` | (isi) |
| `DB_NAME` | (isi) |
| `JWT_SECRET` | (48 karakter) |
| `CLOUDINARY_CLOUD_NAME` | (isi) |
| `CLOUDINARY_API_KEY` | (isi) |
| `CLOUDINARY_API_SECRET` | (isi) |
| `CLOUDINARY_URL` | (opsional, untuk debugging) |
| `EMAIL_USER` | (opsional, untuk fitur email) |
| `EMAIL_PASSWORD` | (opsional) |

> **Jangan pernah menempel .env ke mana pun.** Taruh nilainya langsung ke form Railway.

### 3. KOMIT SEMUA PERUBAHAN CLIENT DULU

Ini langkah yang paling sering dilupakan dan bisa membuat demo gagal.

Buka terminal (Git Bash) di folder `C:\Users\ASR-BJM-PUTRAKYTANGI\SINGGAH` dan jalankan:

```bash
cd C:\Users\ASR-BJM-PUTRAKYTANGI\SINGGAH
git status --short client/
```

Jika ada daftar file (terutama `NavbarUser.jsx`, `ManageProjectsSection.jsx`, `EditKaryaSection.jsx`, dll.), **semua harus di-commit dulu** sebelum deploy ke Vercel. Vercel deploy dari branch `main`, file yang belum di-commit tidak akan ikut.

Untuk men-commet:
```bash
git add client/
git commit -m "perubahan UI terbaru untuk demo"
git push origin main
```

Lakukan hal yang sama untuk file yang belum terlacak:
```bash
git add client/scripts/lint-progress.mjs client/src/components/sections/admin/ManageProjects/AdminRevisionQueue.jsx
git commit -m "tambahan file untuk demo"
git push origin main
```

> Setelah ini, pastikan `git status` menunjukkan **0 file berubah**. Kalau tidak nol, perbaiki dulu sebelum lanjut.

---

## FASE 1 — RAILWAY (backend)

### Langkah 1: Buat project
1. Buka [https://railway.com](https://railway.com), login dengan GitHub
2. Di dashboard, klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Cari repo **`SINGGAH`** → klik
5. Pilih **branch `main`**
6. Klik **"Deploy"**

### Langkah 2: Atur Root Directory
Setelah deploy dimulai, Railway mungkin gagal karena tidak tahu root-nya.
1. Di dashboard project, klik **"Settings"** (ikon gear)
2. Klik **"General"**
3. Cari **"Root Directory"**
4. Ubah dari `/` menjadi **`server`**
5. Klik **"Save"**
6. Deploy akan otomatis jalan ulang

### Langkah 3: Pilih Region
1. Di Settings → **"General"**
2. Cari **"Region"**
3. Pilih **Singapore** (untuk user Indonesia, latensi paling pendek)
4. Klik **"Save"**

### Langkah 4: Isi Environment Variables
1. Di Settings → **"Variables"**
2. Klik **"+ Add Variable"** untuk setiap baris di bawah ini.
3. **Isi `Value`** dengan nilai dari `.env` lokalmu (dari prasyarat #2).
4. **Jangan isi `PORT`** — Railway menentukannya sendiri.

Salin persis (satu per satu):

```
KEY                           VALUE
──────────────────────────────────────────────────────────
NODE_ENV                      production
TRUST_PROXY                   1
DB_PORT                       4000
DB_POOL_MAX                   20
DB_POOL_MIN                   2
FRONTEND_URL                  ← ISI NANTI SETELAH VERCEL JADI (langkah 5)
JWT_SECRET                    ← paste 48 karakter dari .env kamu
CLOUDINARY_CLOUD_NAME         ← dari .env
CLOUDINARY_API_KEY            ← dari .env
CLOUDINARY_API_SECRET         ← dari .env
DB_HOST                       ← dari .env
DB_USER                       ← dari .env
DB_PASSWORD                   ← dari .env
DB_NAME                       ← dari .env
```

> **Yang TIDAK perlu diisi:** `PORT`, `SERVER_BACKLOG`, `PM2_INSTANCES`, `REDIS_URL`.
> `DB_SSL` dan `CACHE_IN_TEST` juga tidak perlu — `DB_SSL` aktif otomatis.
>
> **URUTAN penting:** Isi `FRONTEND_URL` **paling akhir** karena nilainya baru muncul setelah Vercel selesai (langkah 2).

### Langkah 5: Tunggu dan catat URL Railway
1. Di dashboard, tunggu sampai status berubah **"Healthy"** (hijau)
2. Jika **"Error"** (merah): klik log, cari error, dan periksa apakah `DB_HOST`, `DB_USER`, `DB_PASSWORD` salah ketik
3. Jika **"Deploying"** terus: tunggu 2–3 menit
4. Setelah **Healthy**, catat URL yang muncul — contoh:
   ```
   https://singgah-backend-xxxx.up.railway.app
   ```
5. **Salin URL ini** ke Notepad. Ini nanti jadi `BACKEND_ORIGIN` di Vercel.

### Langkah 6: Uji Railway dari browser (WAJIB)
1. Buka URL Railway di browser
2. Buka `https://singgah-xxxx.up.railway.app/api/health`
3. Seharusnya muncul JSON:
   ```json
   {"success":true,"database":"ok","uptimeSeconds":5,"responseMs":12}
   ```
4. Jika **503**: database tidak terhubung → cek `DB_HOST`, `DB_USER`, `DB_PASSWORD`, pastikan `DB_SSL` tidak dicopot
5. Jika **500**: cek `JWT_SECRET` tidak kosong, pastikan semua env terisi

---

## FASE 2 — VERCEL (frontend)

### Langkah 1: Buat project
1. Buka [https://vercel.com](https://vercel.com), login dengan GitHub
2. Klik **"Add New..."** → **"Project"**
3. Cari repo **`SINGGAH`** → klik
4. Pastikan branch `main` yang dipilih
5. **Framework Preset**: pilih **"Vite"** (otomatis terdeteksi)
6. **Root Directory**: biarkan **`client`** (ini penting — frontend ada di `client/`)
7. Klik **"Deploy"**

### Langkah 2: Atur Environment Variables Vercel
1. Sebelum deploy, klik **"Environment Variables"** (atau Settings → Environment Variables)
2. Tambah variabel:

```
KEY                VALUE
────────────────────────────────────────────
BACKEND_ORIGIN     ← paste URL Railway dari langkah 5 Phase 1
```

> Jangan isi `VITE_API_URL`. Kode client sudah pakai default `/api` yang otomatis di-rewrite ke Railway via `vercel.json`. Menambah `VITE_API_URL` justru bisa membuatnya bypass rewrite.

3. Klik **"Save"**

### Langkah 3: Deploy
1. Klik **"Deploy"**
2. Tunggu 2–4 menit
3. Jika berhasil, Vercel akan kasih URL — contoh:
   ```
   https://singgah-frontend-xxxx.vercel.app
   ```
4. **Salin URL ini** ke Notepad.

### Langkah 4: Kembalikan ke Railway
1. Buka Railway → Settings → Variables
2. Cari `FRONTEND_URL`
3. Isi dengan URL Vercel tadi
4. Klik **"Save"** → Railway akan redeploy otomatis

### Langkah 5: Uji Vercel
1. Buka `https://singgah-xxxx.vercel.app`
2. Pastikan halaman utama muncul
3. Pastikan **tidak** ada error console (buka DevTools → Console, pastikan tidak ada 404 atau CORS error)

---

## FASE 3 — INTEGRASI & VERIFIKASI

### Langkah 1: Tes login
1. Buka website di HP/Laptop
2. Klik **Login**
3. Masukkan email dan password yang valid (dari database kamu)
4. **Harusnya:** halaman utama terbuka, bukan error 401 atau 500
5. Kalau **401**: `JWT_SECRET` salah ketik di Railway → edit, redeploy
6. Kalau **500**: `DB_SSL` atau `DB_HOST` salah → edit, redeploy

### Langkah 2: Tes Hall
1. Buka halaman **Hall** (3D)
2. Tunggu 5–15 detik untuk aset termuat (16 MB via CDN Vercel, lambat kalau koneksi HP lemah)
3. **Harusnya:** scene 3D tampil
4. Kalau **putih/error**: cek apakah `BACKEND_ORIGIN` di Vercel sudah benar (arah ke Railway)

### Langkah 3: Uji beban dengan URL Railway sungguhan
Dari laptop kamu, jalankan:
```bash
cd server
node tests/load/index.js --host=URL-RAILWAY-MU --users=40
```
Contoh:
```bash
node tests/load/index.js --host=singgah-backend-xxxx.up.railway.app --users=40
```
**Harusnya: 7/7 skenario lolos, 0 error.** Kalau gagal, cek troubleshooting di bawah.

---

## FASE 4 — TROUBLESHOOTING

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Login 401 padahal kredensial benar | `JWT_SECRET` salah ketik | Edit Railway env, ganti `JWT_SECRET` dengan persis 48 karakter dari `.env` |
| Login 500 atau error | `NODE_ENV` bukan `production`, atau `DB_SSL` tidak aktif | Pastikan `NODE_ENV=production`. `DB_SSL` aktif otomatis (default true). Jangan hapus. |
| Semua endpoint 503 | Database tidak bisa dihubungi | Cek `DB_HOST`, `DB_USER`, `DB_PASSWORD` sudah benar. Region Singapore sudah dipilih. |
| Halaman putih / error | `BACKEND_ORIGIN` salah atau CORS | Buka URL Vercel, cek DevTools → Console untuk error CORS. Pastikan `BACKEND_ORIGIN` = URL Railway. |
| CORS error di console | `FRONTEND_URL` di Railway belum di-set dengan URL Vercel | Edit Railway env, set `FRONTEND_URL` = URL Vercel, redeploy Railway. |
| Aset Hall tidak muncul (error 404) | Vercel root bukan `client`, atau file belum di-commit | Pastikan Root Directory = `client` di Vercel. Pastikan file client sudah di-commit (Phase 0). |
| Build gagal di Vercel | `client/package.json` rusak atau dependency hilang | Jalankan `npm install` di folder `client` lokal, commit, push. |
| Railway error "Build failed" | `package.json` root salah (seharusnya `server/package.json`) | Pastikan Root Directory = `server` di Railway. |
| Health check 503 | `sequelize` tidak bisa connect ke TiDB | Cek apakah TiDB Cloud masih aktif. Cek apakah `DB_SSL=true`. |
| 404 di `/api/health` | Endpoint health belum diterapkan | Pastikan commit terbaru sudah masuk. Cek `git log` di Railway dashboard. |
| Website lambat tapi tidak error | Railway masih loading pertama kali, atau cache belum panas | Ini normal untuk pertama kali. Muat ulang halaman. |

---

## FASE 5 — HARI DEMO

### 30 menit sebelum presentasi
- [ ] Buka `https://URL-VERCEL-MU` dari HP
- [ ] Pastikan halaman utama muncul
- [ ] Coba **logout** lalu **login** lagi — pastikan session jalan
- [ ] Buka **Hall** di HP — tunggu sampai scene 3D muncul (5-15 detik pertama)
- [ ] Pastikan semua tombol navigation berfungsi

### Saat presentasi
- [ ] Jangan tutup browser HP selama demo (Railway tidak tidur, tapi connection bisa timeout setelah lama tidak dipakai)
- [ ] Jika presenter login, gunakan akun yang sudah punya akses
- [ ] Tunjukkan **beranda**, **proyek**, **news**, dan **Hall** sebagai 4 demo utama
- [ ] Kalau ada yang tanya "kalau 1000 orang?", jawab: sudah diuji 40 orang concurrent, 0 error, p95 151 ms

### Jika terjadi masalah saat demo
- **Website error 500:** Tunggu 1 menit (Railway mungkin me-restart worker), refresh.
- **Login tidak bisa:** Coba login dengan browser lain, atau coba akses langsung ke Railway URL (`/api/health`) untuk confirm server masih hidup.
- **Hall tidak muncul:** Ini bagian berat (16 MB). Tunjukkan saja bagian lain dulu, dan jelaskan bahwa Hall di CDN Vercel sehingga perlu waktu download pertama kali.

---

## LAMPIRAN — Ringkasan env var

### Yang WAJIB diisi di Railway
```
NODE_ENV=production
TRUST_PROXY=1
DB_PORT=4000
DB_POOL_MAX=20
DB_POOL_MIN=2
JWT_SECRET=<48 karakter dari .env kamu>
CLOUDINARY_CLOUD_NAME=<dari .env>
CLOUDINARY_API_KEY=<dari .env>
CLOUDINARY_API_SECRET=<dari .env>
DB_HOST=<dari .env>
DB_USER=<dari .env>
DB_PASSWORD=<dari .env>
DB_NAME=<dari .env>
FRONTEND_URL=<URL Vercel, isi setelah Vercel jadi>
```

### Yang TIDAK perlu diisi
```
PORT          # Railway tentukan sendiri
SERVER_BACKLOG  # default 8192 sudah aman
PM2_INSTANCES # Railway 1 worker, tidak relevan
REDIS_URL     # cache RAM sudah cukup untuk 40 user
VITE_API_URL  # default /api, sudah di-rewrite oleh vercel.json
```

### Yang TIDAK boleh diubah
```
DB_SSL        # Jangan diubah jadi false — TiDB Cloud mewajibkan SSL
```

### Untuk Vercel
```
BACKEND_ORIGIN = https://singgah-xxxx.up.railway.app
```

---

## LAMPIRAN — Info tambahan

### Kredit Railway
- Gratis trial: **$5 kredit** untuk **30 hari**
- 40 user dengan 1GB RAM cukup untuk demo 30 hari
- Setelah 30 hari, kredit habis → platform akan meminta bayar atau menurunkan resource
- Untuk ke depan: naik ke **Hobby $5/bulan** kalau website masih dipakai

### Kapasitas yang sudah terbukti
| Skenario | Hasil |
|---|---|
| 40 user burst | p95 41–135 ms, 0 error |
| 40 user beranda | p95 54 ms, 0 error |
| 40 user sustained 30 detik | p95 57–151 ms, 0 error |
| 400 user (diperkirakan) | Perlu uji, tapi kapasitas server cukup |
| 1000 user | Tidak akan kuat — butuh VPS $6-12/bulan |

### Yang tidak bisa diuji dari sini
- Kinerja Hall 3D di 40 HP sekaligus (GPU masing-masing beda)
- Koneksi dari luar Indonesia (VPS di Singapore, tapi uji dari luar negeri mungkin lambat)
- Downtime besar (Vercel atau Railway mati total)

### Backup plan kalau semua gagal
Kalau Railway dan Vercel tidak mau jalan malam ini:
1. Tetap jalankan server di laptop: `node server.js`
2. Install Cloudflare Tunnel (gratis): `npx cloudflared tunnel --url http://localhost:5000`
3. Cloudflare kasih URL publik HTTPS
4. Taruh link itu di chat kelas
5. Tapi ini **tidak stabil** untuk 40 orang — laptop bisa lambat, dan harus laptop nyala selama demo

> Pilihan terakhir ini hanya untuk antisipasi darurat, bukan rencana utama.
