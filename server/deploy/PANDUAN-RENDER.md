# Panduan Migrasi ke Render.com (SINGGAH)

Kenapa pindah: Railway masuk status **Limited Access** → deploy baru dibekukan,
sehingga perbaikan terbaru tidak bisa live. Render punya free tier
**tanpa kartu kredit** dan mendukung Docker (repo ini sudah punya `Dockerfile`).

Free tier Render: 512 MB RAM, 0.1 CPU, 750 jam instans/bulan, service **tidur
setelah 15 menit idle** (spin-up ~1 menit saat dibangunkan).

---

## Yang sudah disiapkan

| File | Isi |
|---|---|
| `render.yaml` (root) | Blueprint: 1 web service Docker + semua env var |
| `server/.env.render` | Env var siap tempel (di-ignore git, aman) |
| `Dockerfile` | Build client + server, healthcheck pakai `$PORT` dinamis |

Arsitektur hasil migrasi:

```
Vercel  ── frontend (VITE_API_URL) ──▶  Render  ──▶  TiDB (TiDB Cloud)
                                             └──────▶  Cloudinary
```

Render memakai 1 origin untuk API + frontend (Express menyajikan
`client/dist`, lihat `server/server.js:209-219`), jadi `VITE_API_URL=/api`
berarti request API tetap same-origin.

---

## LANGKAH 1 — Push `render.yaml` ke GitHub

Render membaca `render.yaml` dari repo GitHub, jadi file harus ada di branch
yang dipilih (default: `main`).

```bash
git add render.yaml server/.env.render   # .env.render DI-IGNORE git, aman
git status                               # pastikan .env.render TIDAK ikut staged
git commit -m "feat(deploy): blueprint Render.com + panduan migrasi"
git push origin main
```

> `server/.env.render` **sengaja tidak** ikut commit (pola `.env*` di
> `.gitignore`). Kalau `git status` menampilkannya sebagai staged, jalankan
> `git reset server/.env.render`.

---

## LANGKAH 2 — Buat service di Render

1. Buka <https://render.com> → **New** → **Blueprint**
2. Hubungkan repo `arrayhan66/SINGGAH`
3. Render membaca `render.yaml` otomatis → pilih branch `main`
4. Klik **Apply**

Render akan membuat service `singgah` (plan Free, region: pilih **Singapore**
biar dekat dengan Railway/TiDB Asia).

---

## LANGKAH 3 — Isi env var (16 nilai)

Di halaman service → **Environment** → **Add from .env**:

1. Buka `server/.env.render` di editor (isi rahasia, jangan di-share)
2. Salin **semua baris** (tanpa baris komentar `#`) → paste ke kolom "Add from .env"
3. Simpan

Isinya: `FRONTEND_URL`, `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `EMAIL_USER`, `EMAIL_PASSWORD`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`REDIS_URL`, `RESEND_API_KEY`, `SENDLIB_API_KEY`, `SENDLIB_FROM_EMAIL`,
`VITE_GOOGLE_CLIENT_ID`.

Nilai yang sudah ter-set di `render.yaml` (jangan diubah):
`NODE_ENV=production`, `TRUST_PROXY=1`, `PM2_INSTANCES=1`, `VITE_API_URL=/api`,
`DB_PORT=4000`, `DB_POOL_MAX=5`, `DB_POOL_MIN=1`.

> **`REDIS_URL` boleh dikosongkan.** Kalau kosong, app pakai cache memori dan
> `PM2_INSTANCES` sudah dipaksa `1` supaya rate limiter tidak longgar.
> Tapi kalau Redis ada (Railway/Koyeb/upstash), isi — lebih aman.

> **`FRONTEND_URL`** = `https://singgah-flax.vercel.app,https://singgah.onrender.com`
> (dipisah koma). Dipakai untuk whitelist CORS (`server/server.js:77-93`).
> Kalau nanti frontend juga pindah ke Render, cukup URL Render saja.

---

## LANGKAH 4 — Tunggu build & verifikasi

Build Docker ±3-5 menit (npm ci client + server). Setelah **Live**:

```bash
curl https://singgah.onrender.com/api/health
# {"success":true,"database":"ok",...}

curl https://singgah.onrender.com/api/projects
# harus JSON, bukan HTML
```

Kalau masih `503` → cek tab **Logs**, cari error startup.

---

## LANGKAH 5 — Arahkan frontend Vercel ke Render

Vercel → Project SINGGAH → **Settings** → **Environment Variables**:

| Environment | Key | Value |
|---|---|---|
| **Production** | `VITE_API_URL` | `https://singgah.onrender.com/api` |
| **Preview** | `VITE_API_URL` | `https://singgah.onrender.com/api` |

Lalu **Deployments** → titik tiga → **Redeploy**.

> Kenapa `Preview` juga: kalau tidak, preview memakai default `/api` (relatif)
> → kena rewrite SPA di `client/vercel.json` → balikin HTML, bukan JSON.

Setelah itu: `curl -H "Origin: https://singgah-flax.vercel.app" https://singgah.onrender.com/api/projects`
harus `200` (CORS lolos).

---

## LANGKAH 6 — Matikan auto-deploy Railway & kunci demo

Railway → service SINGGAH → **Settings** → **"Redeploy on push" = OFF**.

Efeknya: service Railway yang masih hidup **tidak pernah** berubah karena
push ke `main`. Railway jadi cadangan (fallback) kalau Render bermasalah.

---

## LANGKAH 7 — Workflow developedagi (demo magang tetap utuh)

```
main  →  demo magang (Vercel Production + Render)   ← beku
dev   →  Vercel Preview (otomatis, gratis)          ← tempat ngoding
```

```bash
git checkout -b dev
# ... ngoding ...
git add -A && git commit -m "..." && git push -u origin dev
```

Vercel otomatis bikin **Preview Deployment** untuk branch `dev` → URL baru
bisa dites tanpa menyentuh demo. Preview & production memakai **backend &
DB yang sama**, jadi data tes ikut kelihatan di demo — hindari upload karya
dummy saat preview.

Promote ke demo (opsional, nanti):
```bash
git checkout main && git merge dev && git push origin main
```

---

## Catatan free tier

- **Service tidur setelah 15 menit idle**, bangun ±1 menit.
  Untuk demo, Supaya ga ada jeda: pakai pinger gratis
  <https://cron-job.org> (cron tiap 10 menit, GET `/api/health`) supaya
  service tetap hangat.
- Render free web service **tidak bisa kirim email lewat SMTP** (port
  25/465/587 diblokir). SINGGAH kirim email lewat **SendLib HTTP API**
  (`server/utils/sendEmail.js`), jadi tidak terpengaruh.
- 750 jam instans/bulan per workspace. Service yang tidur tidak memakai kuota.

---

## Rollback

Railway masih hidup dan masih serve kode lama (versi yang sebelum perbaikan
upload). Kalau Render bermasalah, arahkan `VITE_API_URL` di Vercel kembali ke
`https://singgah-production.up.railway.app/api` lalu redeploy Vercel.
