require("dotenv").config()
require("../config/env")

const { News, sequelize } = require("../models")
const { QueryTypes } = require("sequelize")

const NEWS = [
  {
    title: "Pameran Karya Mahasiswa Teknik Elektro 2026 Resmi Dibuka",
    slug: "pameran-karya-mahasiswa-teknik-elektro-2026-resmi-dibuka",
    headline_image: "https://placehold.co/1200x630/0a2472/38bdf8?text=PamerIT+2026",
    winner: "Politeknik Negeri Banjarmasin",
    date: "2026-07-27",
    source: "Admin SINGGAH",
    summary:
      "Pameran tahunan SINGGAH resmi dibuka, menampilkan berbagai karya inovasi digital mahasiswa Teknik Elektro.",
    tags: JSON.stringify(["Kegiatan", "Pameran"]),
    content:
      "Pameran Karya Mahasiswa Teknik Elektro 2026 resmi dibuka di gedung utama Politeknik Negeri Banjarmasin. Acara ini menampilkan berbagai inovasi digital mulai dari aplikasi mobile, website, Internet of Things, hingga kecerdasan buatan.\n\nKegiatan ini menjadi wadah bagi mahasiswa untuk memperkenalkan karya terbaik mereka kepada publik, akademisi, dan mitra industri. Pengunjung dapat mengeksplorasi setiap karya secara interaktif.\n\nPameran akan berlangsung hingga akhir minggu ini dan terbuka untuk umum secara gratis.",
    status: "published",
  },
  {
    title: "Workshop Pengembangan Aplikasi Mobile untuk Mahasiswa",
    slug: "workshop-pengembangan-aplikasi-mobile-untuk-mahasiswa",
    headline_image: "https://placehold.co/1200x630/0a2472/06b6d4?text=Workshop+Mobile",
    winner: "Himpunan Mahasiswa Elektro",
    date: "2026-08-05",
    source: "Admin SINGGAH",
    summary:
      "Workshop intensif pengembangan aplikasi mobile dengan Flutter bagi mahasiswa Teknik Elektro.",
    tags: JSON.stringify(["Workshop", "Edukasi"]),
    content:
      "Jurusan Teknik Elektro mengadakan workshop pengembangan aplikasi mobile menggunakan Flutter. Workshop ini diikuti oleh mahasiswa dari berbagai angkatan.\n\nPeserta belajar mulai dari dasar Flutter, pengelolaan state, hingga deployment aplikasi ke Google Play Store.\n\nWorkshop diakhiri dengan sesi project showcase di mana setiap kelompok mempresentasikan aplikasi buatan mereka.",
    status: "published",
  },
  {
    title: "SINGGAH Raih Penghargaan Inovasi Digital Tingkat Provinsi",
    slug: "singgah-raih-penghargaan-inovasi-digital-tingkat-provinsi",
    headline_image: "https://placehold.co/1200x630/0a2472/34d399?text=Prestasi",
    winner: "Tim SINGGAH",
    date: "2026-08-10",
    source: "Admin SINGGAH",
    summary:
      "Platform SINGGAH berhasil meraih penghargaan sebagai inovasi digital terbaik tingkat provinsi.",
    tags: JSON.stringify(["Prestasi", "Penghargaan"]),
    content:
      "Platform pameran digital SINGGAH berhasil meraih penghargaan sebagai inovasi digital terbaik tingkat provinsi Kalimantan Selatan.\n\nPenghargaan ini diberikan atas kontribusi SINGGAH dalam memajukan digitalisasi karya mahasiswa dan memperluas akses publik terhadap hasil inovasi teknologi.\n\nKami mengucapkan terima kasih kepada seluruh mahasiswa dan dosen yang telah berpartisipasi.",
    status: "published",
  },
]

;(async () => {
  try {
    await sequelize.authenticate()
    const [author] = await sequelize.query(
      "SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1",
      { type: QueryTypes.SELECT },
    )
    if (!author) throw new Error("Tidak ada user admin")

    const existing = await News.count()
    if (existing > 0) {
      console.log(`Skip: sudah ada ${existing} berita di database`)
      process.exit(0)
    }

    for (const n of NEWS) {
      await News.create({
        ...n,
        author_id: author.id,
        published_at: new Date(),
      })
    }
    console.log(`Berhasil menambahkan ${NEWS.length} berita (author id ${author.id})`)
    process.exit(0)
  } catch (err) {
    console.error("Seed news gagal:", err.message)
    process.exit(1)
  }
})()
