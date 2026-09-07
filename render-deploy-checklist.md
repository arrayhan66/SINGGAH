# Checklist Deploy Render — SINGGAH

Panduan langkah-demi-langkah memasang backend + frontend SINGGAH di Render
dengan biaya nol (free tier). Frontend otomatis dibuild di dalam image
(Dockerfile multi-stage) dan disajikan oleh Express — jadi **satu** service saja.

---

## 1. Sebelum mulai

- [ ] Semua perubahan sudah di-commit & di-push ke `origin/main`
      (yang terakhir: media → Cloudinary + siap deploy Render).
- [ ] Kamu punya nilai semua kunci rahasia berikut (di `server/.env` lama dan/atau
      `server/.env.cloudinary.bak`):
  - DB TiDB Cloud: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
  - `JWT_SECRET`
  - Email pengirim: `EMAIL_USER`, `EMAIL_PASSWORD`
  - Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Google OAuth: `GOOGLE_CLIENT_ID` (+ `VITE_GOOGLE_CLIENT_ID` — nilainya sama)

## 2. Izinkan Render mengakses TiDB Cloud

- [ ] Buka TiDB Cloud → Cluster kamu → **Security** → **IP Access List**.
- [ ] Tambahkan **Allow All** (`0.0.0.0/0`) untuk sementara, ATAU masukkan range
      IP egress Render (Render menggunakan IP publik dinamis, jadi Allow All paling
      praktis utk free tier). Berlaku maks ~30 menit sebelum perubahan dipakai.

## 3. Buat service dari blueprint

- [ ] Login ke [dashboard.render.com](https://dashboard.render.com)
      (hubungkan akun GitHub).
- [ ] Klik **New +** → **Blueprint**. Render akan membaca `render.yaml` (ada di root repo)
      dan membuat service bernama `singgah-api` (Docker, free).
- [ ] Pilih repo `arrayhan66/SINGGAH` → mulai deploy. Build otomatis membaca
      `./server/Dockerfile`, runtime `CMD node server.js`, healthcheck `/`.

## 4. Isi Environment Variables (penting!)

Di service `singgah-api` → **Environment** → Add Environment Variable:

| Nama | Nilai | Wajib? |
|---|---|---|
| `NODE_ENV` | `production` | wajib |
| `JWT_SECRET` | nilai lama (sembarang string panjang) | wajib |
| `DB_HOST` | host TiDB Cloud | wajib |
| `DB_PORT` | port TiDB (umumnya `4000`) | wajib |
| `DB_NAME` | nama database | wajib |
| `DB_USER` | user database | wajib |
| `DB_PASSWORD` | password database | wajib |
| `EMAIL_USER` | email pengirim notifikasi | wajib |
| `EMAIL_PASSWORD` | password aplikasi email | wajib |
| `CLOUDINARY_CLOUD_NAME` | dari `.env.cloudinary.bak` | wajib |
| `CLOUDINARY_API_KEY` | dari `.env.cloudinary.bak` | wajib |
| `CLOUDINARY_API_SECRET` | dari `.env.cloudinary.bak` | wajib |
| `GOOGLE_CLIENT_ID` | ID OAuth Google | opsional (tanpa ini tombol Google login tersembunyi) |
| `VITE_GOOGLE_CLIENT_ID` | **sama dengan di atas** — dipakai saat build bundle | opsional |
| `FRONTEND_URL` | URL service Render, mis. `https://singgah-api.onrender.com` (boleh dipisah koma) | opsional |
| `REDIS_URL` | kalau pakai Redis utk rate limiter | opsional |
| `DISABLE_RATE_LIMIT` | `false` | opsional |
| `LOG_LEVEL` | `info` | opsional |

Catatan:
- `VITE_API_URL` tidak diisi → frontend pakai origin yang sama (`/api`), karena
  Express sudah menyajikan build frontend dan API di service yang sama.
- Setelah semua env dipasang, klik **Save Changes** → Render otomatis deploy ulang.

## 5. Setelah deploy selesai

- [ ] Klik URL service → harus muncul `SINGGAH API is running` di `/`.
- [ ] Buka `/` di browser → halaman SINGGAH harus tampil (bukan 404).
- [ ] Coba login admin & simpan data → media harus tampil (dari Cloudinary).
- [ ] Cek di TiDB Cloud tidak ada error auth/connection.

## 6. Migrasi media lama (WAJIB sekali jalan)

Record lama di DB masih menunjuk ke `/uploads/...` yang tidak lagi dilayani.
Jalankan dari folder `server` (di PC yang punya akses DB):

```
# cek dulu rencana (tidak mengubah apa pun)
npm run migrate:media:dry

# kalau hasilnya masuk akal, jalankan sungguhan
npm run migrate:media
```

Skrip ini: mencari semua kolom berisi `/uploads/`, meng-upload file yang ada
di `server/uploads/` ke Cloudinary, lalu memperbarui URL di DB. File lokal
tidak dihapus. Aman dijalankan ulang (URL yang sudah Cloudinary dilewati).

## 7. Biar tidak "tidur" di free tier

- [ ] Free tier Render idle setelah **15 menit** tanpa request dan cold start ±50 detik.
- [ ] Opsional: daftarkan monitor murah seperti **UptimeRobot** untuk ping
      `https://<service>.onrender.com` tiap 10 menit agar instance tetap aktif.
      (API gratis UptimeRobot cukup.)
- [ ] Kalau mau tanpa cold start & tanpa pinger → upgrade ke paid/Always-On.

## 8. Rollback / troubleshooting

- [ ] Deploy gagal build: lihat log di **Events**; kemungkinan besar env
      `DB_HOST`/`DB_PORT` salah atau TiDB IP Access List menolak Render.
- [ ] Login Google tidak muncul: pastikan `VITE_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_ID`
      terisi lalu **Save Changes** (deploy ulang) — nilainya harus sama.
- [ ] Media 404: jalankan kembali `npm run migrate:media` dan cek log Cloudinary.
- [ ] Mau kembali ke versi lama: Render → service → **Manual Deploy** → pilih commit lain.