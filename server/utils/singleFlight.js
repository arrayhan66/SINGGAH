// Mencegah cache stampede: saat satu key cache miss dan ratusan request
// datang bersamaan, hanya SATU yang menembak ke database. Sisanya
// menunggu promise yang sama.
//
// Dipakai untuk lookup yang jalan di setiap request (Setting, user auth)
// supaya TTL pendek tidak berubah jadi lonjakan query ke database.
//
// PENTING: promise yang ditunggu harus punya batas waktu. Kalau query ke
// database nyangkut (koneksi TiDB putus di tengah jalan, pool habis, dll),
// semua request berikutnya untuk key itu akan menunggu selamanya dan proxy
// hosting (hcdn) memutusnya sebagai 503 setelah ratusan detik. Dengan timeout,
// request gagal cepat dengan 503 yang bisa di-retry dan worker tetap sehat.
const AppError = require("./AppError")

const DEFAULT_TIMEOUT_MS = parseInt(process.env.SINGLE_FLIGHT_TIMEOUT_MS, 10) || 20_000

const inflight = new Map()

module.exports = async function singleFlight(key, fn, timeoutMs = DEFAULT_TIMEOUT_MS) {
  if (inflight.has(key)) return inflight.get(key)

  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new AppError("Permintaan terlalu lama, silakan coba lagi", 503))
    }, timeoutMs)
  })

  const promise = Promise.race([Promise.resolve().then(fn), timeout]).finally(() => {
    clearTimeout(timer)
    inflight.delete(key)
  })

  inflight.set(key, promise)
  return promise
}
