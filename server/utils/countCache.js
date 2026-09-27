// Cache untuk nilai total (COUNT) pada endpoint daftar.
//
// Latar belakang: Sequelize.findAndCountAll() menjalankan count() dan
// findAll() secara paralel, jadi satu request HTTP memegang DUA koneksi
// database sekaligus. Pada beban tinggi itu membuat pool habis sebelum
// query selesai. Terukur pada load test: 6.265 SequelizeConnectionAcquireTimeoutError
// dan hanya 19 req/s, padahal TiDB mampu ~1.300 qps.
//
// Memisahkan count() dari findAndCountAll() dan menyimpan hasilnya membuat
// tiap request hanya membutuhkan satu koneksi. Total daftar jarang berubah
// tiap detik, jadi TTL pendek cukup dan metadata pagination tetap tersedia
// tanpa harus menghitung ulang.
//
// Catatan: total bisa basi sampai TTL habis (mis. 30 detik setelah berita
// baru dibuat). Untuk nomor halaman itu tidak masalah.
const cache = require("./cache")
const singleFlight = require("./singleFlight")

const DEFAULT_TTL_MS = 30_000

const countWithCache = async (key, compute, ttlMs = DEFAULT_TTL_MS) => {
  const cached = await cache.get(key)
  if (typeof cached === "number") return cached

  // singleFlight mencegah ribuan request paralel menghitung total yang sama
  // sekaligus saat cache baru saja kosong.
  return singleFlight(key, async () => {
    const afterWait = await cache.get(key)
    if (typeof afterWait === "number") return afterWait

    const total = await compute()
    await cache.set(key, total, ttlMs)
    return total
  })
}

module.exports = { countWithCache, DEFAULT_TTL_MS };
