# Use Case Diagram — SINGGAH

Dokumentasi use case untuk **SINGGAH**, aplikasi galeri karya mahasiswa dan dosen
POLIBAN. Seluruh isian diagram diturunkan dari kode sumber pada repositori ini,
bukan dari dokumentasi terpisah, sehingga tetap sinkron dengan perilaku aplikasi.

Format file adalah [PlantUML](https://plantuml.com), sehingga diagram dapat
dirender menjadi PNG, SVG, atau PDF.

## Daftar Diagram

| File | Cakupan | Jumlah UC |
|------|---------|-----------|
| `00-overview.puml` | Batas sistem dan posisi seluruh aktor | — |
| `01-visitor.puml` | Pengunjung tanpa sesi login | 17 |
| `02-autentikasi.puml` | Pendaftaran, login, pemulihan password | 12 |
| `03-profil.puml` | Profil, verifikasi tipe akun, notifikasi | 12 |
| `04-mahasiswa-karya.puml` | Pengajuan dan pengelolaan karya mahasiswa | 16 |
| `05-dosen.puml` | Pengelolaan karya dosen | 13 |
| `06-admin-dashboard.puml` | Dashboard admin dan pengumuman massal | 8 |
| `07-admin-karya.puml` | Moderasi, publikasi, dan revisi karya | 15 |
| `08-admin-berita.puml` | Penulisan dan penerbitan artikel berita | 17 |
| `09-admin-pengguna.puml` | Manajemen akun dan verifikasi pengguna | 12 |
| `10-admin-kategori-media.puml` | Kategori karya dan perpustakaan media | 14 |
| `11-admin-laporan-pengaturan.puml` | Statistik, pengaturan, mode maintenance | 13 |
| `12-sistem-internal.puml` | Proses otomatis yang tidak dipicu pengguna | 17 |

## Aktor

Sistem memiliki lima aktor. Mahasiswa dan Dosen merupakan turunan dari
Pengguna Terdaftar karena keduanya dibedakan hanya oleh atribut `tipe` pada
model data, bukan oleh alur akses yang terpisah.

| Aktor | Peran | Keterangan |
|-------|-------|------------|
| Pengunjung | Pengamat | Tidak memiliki sesi login. Akses hanya ke konten publik. |
| Pengguna Terdaftar | Peserta | Sudah login dan terverifikasi, tetapi belum tentu memiliki tipe khusus. |
| Mahasiswa | Kontributor | Tipe `mahasiswa`. Wajib melalui proses review sebelum karya tayang. |
| Dosen | Kontributor | Tipe `dosen`. Karya tayang langsung tanpa review. |
| Admin | Pengelola | Peran `admin`. Mengelola seluruh isi situs. |

## Cara Menampilkan Diagram

### Cara paling cepat

Unggah file `.puml` ke [plantuml.com/plantuml/uml](http://www.plantuml.com/plantuml/uml).

### VS Code

Pasang ekstensi [PlantUML](https://marketplace.visualstudio.com/items?itemName=jelmer.puml)
lalu buka file `.puml`. Diagram akan tampil di panel samping dan dapat diekspor
dengan `Alt+D`.

### Terminal

Jalankan skrip render yang disediakan. Skrip ini memerlukan Java dan satu file
`plantuml.jar`.

```bash
# Windows
./render.sh

# Linux dan macOS
bash render.sh
```

Hasil render disimpan di folder `png/`. Folder tersebut tidak ikut dimasukkan ke repositori
karena merupakan berkas biner yang besar.

## Alur Utama Sistem

### Alur Karya Mahasiswa

```
Mahasiswa membuat draft
        |
        v
  Kirim karya  ----->  status: pending  (tidak tampil di publik)
        |
        v
   Admin review
     |         |
     v         v
 published   rejected
     |         |
     v         v
  Tayang    Mahasiswa memperbaiki
  di Hall   lalu mengirim ulang
     |
     v
Edit setelah tayang
     |
     v
Revisi  ----->  status: pending  (karya lama tetap tayang)
     |
     v
  Admin review revisi
```

### Perbedaan Mahasiswa dan Dosen

| Aspek | Mahasiswa | Dosen |
|-------|-----------|-------|
| Status karya saat dikirim | `pending` | `published` |
| Review admin | Diperlukan | Tidak diperlukan |
| Edit karya yang sudah tayang | Berubah menjadi pengajuan revisi | Langsung memperbarui |
| Status `rejected` | Tersedia | Tidak tersedia |
| Penempatan di Hall | Lantai 1 | Lantai 2 |

## Aturan Bisnis

### Kapasitas Hall

| Aturan | Nilai | Lokasi |
|--------|-------|--------|
| Maksimal karya mahasiswa per kategori | 48 | `projectService.js:60` |
| Maksimal karya dosen per kategori | 48 | `projectService.js:67` |

Karya tidak dapat dipublikasikan apabila kategori tujuan sudah mencapai batas.

### Kategori

| Aturan | Nilai | Lokasi |
|--------|-------|--------|
| Maksimal jumlah kategori | 10 | `useManageCategories.js:10` |
| Minimal kategori aktif | 1 | `useManageCategories.js:15` |

Kategori yang dinonaktifkan akan disembunyikan dari halaman Karya dan tidak
memiliki bangunan di Hall 3D. Karena itu minimal satu kategori harus tetap aktif.

### Penganjur

| Aturan | Nilai | Lokasi |
|--------|-------|--------|
| Slot karya unggulan per kategori | 2 untuk mahasiswa, 2 untuk dosen | `projectService.js:618` |
| Maksimal karya di slideshow beranda | 6 | `constants/slideshow.js:1` |

Karya hanya dapat dimasukkan ke slideshow beranda apabila sudah berstatus
`published` dan telah ditandai sebagai karya unggulan.

### Konten

| Aturan | Nilai | Lokasi |
|--------|-------|--------|
| Maksimal galeri per karya | 10 berkas | `projectRoutes.js:96` |
| Maksimal dokumen per karya | 10 berkas | `projectRoutes.js:97` |
| Batas ukuran unggahan | 10 MB (bawaan) | `settingsHelpers.js:17` |

## Keterbatasan yang Teridentifikasi

Hal-hal berikut teridentifikasi saat penyusunan diagram dan perlu diperhatikan
apabila sistem dikembangkan lebih lanjut:

|_LEVEL | Uraian | Lokasi |
|--------|--------|--------|
| Tinggi | Mode maintenance hanya ditegakkan di sisi peramban, bukan di server. | `MaintenanceGate.jsx` |
| Tinggi | Admin dapat menghapus akunnya sendiri tanpa perlindungan admin terakhir. | `ProfileDangerZone.jsx` |
| Sedang | Perbandingan bulanan pada laporan selalu membandingkan bulan berjalan, sehingga tidak akurat untuk tahun sebelumnya. | `ReportsHero.jsx:109` |
| Sedang | Batas kategori dan batas slideshow tertulis di kode peramban dan server secara terpisah tanpa pemeriksaan konsistensi. | `useManageCategories.js:10` |
| Rendah | Panel notifikasi dan aktivitas menutupi kegagalan tanpa memberi tahu admin. | `NotificationContext.jsx` |

## Catatan Methodology

Diagram disusun dengan membaca kode sumber secara langsung:

- Rute antarmuka pada `client/src/routes/AppRouter.jsx`
- Endpoint pada `server/routes/`
- Logika bisnis pada `server/services/`
- Perilaku antarmuka pada `client/src/components/` dan `client/src/context/`

Apabila terdapat ketidaksesuaian antara diagram dan perilaku aplikasi,
behavior yang berjalan adalah rujukan yang benar.
