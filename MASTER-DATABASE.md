# SINGGAH
## Sistem Informasi Gelar Gagasan

# MASTER DATABASE
### Versi 1.0

Disusun sebagai acuan pengembangan sistem, database, API, frontend, backend, serta dokumentasi Tugas Akhir.

---

## DAFTAR ISI

1. Gambaran Sistem
2. Tujuan Sistem
3. Role Pengguna
4. Hak Akses
5. Alur Sistem
6. Daftar Tabel
7. Relasi Database
8. Detail Seluruh Tabel
9. Validasi Data
10. Dummy Data
11. API Endpoint
12. Flow Sistem
13. Dashboard
14. Statistik
15. Lampiran

---

## 1. GAMBARAN SISTEM

### Nama Sistem

**SINGGAH** (Sistem Informasi Gelar Gagasan)

SINGGAH merupakan platform digital yang digunakan untuk mengumpulkan, mengelola, mempublikasikan, dan memamerkan hasil karya akademik civitas kampus.

Seluruh mahasiswa maupun dosen dapat mengunggah hasil karya seperti:

- Website
- Mobile App
- Artificial Intelligence
- Internet of Things
- Desktop Application
- Game
- UI/UX
- Data Science
- Cyber Security
- Machine Learning

agar dapat dilihat masyarakat umum.

Selain sebagai media publikasi, SINGGAH juga menjadi media dokumentasi seluruh hasil karya mahasiswa setiap tahunnya.

---

## 2. TUJUAN SISTEM

Tujuan utama sistem ini adalah:

1. Menyediakan wadah publikasi karya mahasiswa.
2. Mempermudah kampus mendokumentasikan seluruh karya.
3. Meningkatkan branding kampus melalui karya mahasiswa.
4. Memberikan portofolio digital kepada mahasiswa.
5. Menyediakan referensi penelitian untuk mahasiswa lain.
6. Mempermudah dosen melakukan monitoring karya.
7. Menyediakan statistik perkembangan karya.
8. Mempermudah pencarian project berdasarkan kategori.
9. Menyediakan berita kegiatan kampus.
10. Memberikan sistem notifikasi kepada pengguna.

---

## 3. ROLE PENGGUNA

Dalam sistem terdapat empat tipe pengguna:

### 1. ADMIN

**Deskripsi:** Mengelola seluruh sistem.

**Hak akses:**
- ✔ Kelola user
- ✔ Kelola project
- ✔ Kelola berita
- ✔ Kelola kategori
- ✔ Approve project
- ✔ Reject project
- ✔ Publish project
- ✔ Dashboard
- ✔ Statistik
- ✔ Hapus project siapa saja

### 2. DOSEN

**Deskripsi:** Mengunggah project penelitian atau karya dosen.

**Hak akses:**
- ✔ Upload project
- ✔ Edit project milik sendiri
- ✔ Hapus project milik sendiri
- ✔ Melihat seluruh project
- ✔ Memberi komentar
- ✔ Bookmark
- ✔ Like project

### 3. MAHASISWA

**Deskripsi:** Mengunggah hasil tugas maupun karya akademik.

**Hak akses:**
- ✔ Upload project
- ✔ Edit project sendiri
- ✔ Hapus project sendiri
- ✔ Bookmark
- ✔ Like
- ✔ Komentar

> **Catatan:** Project mahasiswa akan masuk status **PENDING** hingga disetujui Admin.

### 4. UMUM

**Deskripsi:** Pengunjung luar kampus.

**Hak akses:**
- ✔ Registrasi
- ✔ Login
- ✔ Melihat seluruh project
- ✔ Melihat berita
- ✔ Memberi like
- ✔ Bookmark
- ✔ Komentar

> **Catatan:** Tidak dapat mengupload project.

---

## 4. HAK AKSES

| Fitur | Admin | Dosen | Mahasiswa | Umum |
|-------|:-----:|:-----:|:---------:|:----:|
| Kelola User | ✔ | - | - | - |
| Kelola Kategori | ✔ | - | - | - |
| Kelola Berita | ✔ | - | - | - |
| Approve/Reject Project | ✔ | - | - | - |
| Dashboard | ✔ | - | - | - |
| Statistik | ✔ | - | - | - |
| Upload Project | - | ✔ | ✔ (pending) | - |
| Edit Project Sendiri | ✔ | ✔ | ✔ | - |
| Hapus Project Sendiri | ✔ | ✔ | ✔ | - |
| Hapus Project Orang Lain | ✔ | - | - | - |
| Melihat Project | ✔ | ✔ | ✔ | ✔ |
| Melihat Berita | ✔ | ✔ | ✔ | ✔ |
| Like | ✔ | ✔ | ✔ | ✔ |
| Bookmark | ✔ | ✔ | ✔ | ✔ |
| Komentar | ✔ | ✔ | ✔ | ✔ |
| Registrasi | - | - | - | ✔ |
| Login | ✔ | ✔ | ✔ | ✔ |

---

## 5. ALUR SISTEM

### Alur Mahasiswa

```
Register → Verifikasi Email → Login → Upload Project → Status Pending → Admin Review → Published → Tampil di Website
```

### Alur Dosen

```
Login → Upload Project → Status Published → Langsung Tampil
```

### Alur Admin

```
Login → Dashboard → Review Project → Approve / Reject → Kelola Seluruh Data
```

---

## 6. DAFTAR TABEL DATABASE

| No | Nama Tabel | Keterangan |
|----|------------|------------|
| 01 | `users` | Data pengguna |
| 02 | `verification_codes` | Kode verifikasi email |
| 03 | `password_resets` | Kode reset password |
| 04 | `categories` | Kategori project |
| 05 | `projects` | Data project utama |
| 06 | `project_images` | Galeri project |
| 07 | `project_members` | Anggota project |
| 08 | `project_documents` | Dokumen pendukung |
| 09 | `project_videos` | Video demo |
| 10 | `project_links` | Github, Website, Figma, dll |
| 11 | `project_likes` | Like project |
| 12 | `project_views` | Riwayat view |
| 13 | `bookmarks` | Project favorit |
| 14 | `comments` | Komentar project |
| 15 | `comment_replies` | Balasan komentar |
| 16 | `notifications` | Notifikasi pengguna |
| 17 | `news` | Berita kampus |
| 18 | `news_categories` | Kategori berita |
| 19 | `activity_logs` | Riwayat aktivitas |
| 20 | `settings` | Konfigurasi sistem |

---

## 7. RELASI DATABASE

```
users (1) ──→ (N) projects
users (1) ──→ (N) verification_codes
users (1) ──→ (N) password_resets
users (1) ──→ (N) project_members
users (1) ──→ (N) project_likes
users (1) ──→ (N) project_views
users (1) ──→ (N) bookmarks
users (1) ──→ (N) comments
users (1) ──→ (N) comment_replies
users (1) ──→ (N) notifications
users (1) ──→ (N) activity_logs

categories (1) ──→ (N) projects
categories (1) ──→ (N) news_categories

projects (1) ──→ (N) project_images
projects (1) ──→ (N) project_members
projects (1) ──→ (N) project_documents
projects (1) ──→ (N) project_videos
projects (1) ──→ (N) project_links
projects (1) ──→ (N) project_likes
projects (1) ──→ (N) project_views
projects (1) ──→ (N) bookmarks
projects (1) ──→ (N) comments

comments (1) ──→ (N) comment_replies

news (1) ──→ (N) news_categories
```

---

## 8. DETAIL SELURH TABEL

> **Status:** Bagian ini akan dilengkapi pada **Part 2** (detail field, tipe data, validasi, relasi, contoh data, dan alasan penggunaan per tabel).

### Tabel yang akan didokumentasi:

| No | Tabel | Status |
|----|-------|--------|
| 01 | `users` | ⏳ Part 2 |
| 02 | `verification_codes` | ⏳ Part 2 |
| 03 | `password_resets` | ⏳ Part 2 |
| 04 | `categories` | ⏳ Part 3 |
| 05 | `projects` | ⏳ Part 3 |
| 06 | `project_images` | ⏳ Part 4 |
| 07 | `project_members` | ⏳ Part 4 |
| 08 | `project_documents` | ⏳ Part 4 |
| 09 | `project_videos` | ⏳ Part 4 |
| 10 | `project_links` | ⏳ Part 4 |
| 11 | `project_likes` | ⏳ Part 5 |
| 12 | `project_views` | ⏳ Part 5 |
| 13 | `bookmarks` | ⏳ Part 5 |
| 14 | `comments` | ⏳ Part 5 |
| 15 | `comment_replies` | ⏳ Part 5 |
| 16 | `notifications` | ⏳ Part 6 |
| 17 | `news` | ⏳ Part 6 |
| 18 | `news_categories` | ⏳ Part 6 |
| 19 | `activity_logs` | ⏳ Part 6 |
| 20 | `settings` | ⏳ Part 6 |

---

## 9. VALIDASI DATA

> **Status:** Bagian ini akan dilengkapi pada Part berikutnya bersama detail tabel.

---

## 10. DUMMY DATA

> **Status:** Bagian ini akan dilengkapi setelah seluruh tabel terdokumentasi.

---

## 11. API ENDPOINT

> **Status:** Bagian ini akan dilengkapi setelah seluruh tabel terdokumentasi.

---

## 12. FLOW SISTEM

> **Status:** Bagian ini akan dilengkapi dengan diagram alur lengkap.

---

## 13. DASHBOARD

> **Status:** Bagian ini akan dilengkapi setelah statistik ditentukan.

---

## 14. STATISTIK

> **Status:** Bagian ini akan dilengkapi bersama dashboard.

---

## 15. LAMPIRAN

> **Status:** Bagian ini akan dilengkapi di akhir dokumentasi.

---

## CHANGELOG

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | 2026-07-27 | Bagian 1: Gambaran Sistem, Tujuan, Role, Hak Akses, Alur, Daftar 20 Tabel, Relasi |
