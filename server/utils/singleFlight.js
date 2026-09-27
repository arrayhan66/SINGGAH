// Mencegah cache stampede: saat satu key cache miss dan ratusan request
// datang bersamaan, hanya SATU yang menembak ke database. Sisanya
// menunggu promise yang sama.
//
// Dipakai untuk lookup yang jalan di setiap request (Setting, user auth)
// supaya TTL pendek tidak berubah jadi lonjakan query ke database.
const inflight = new Map()

module.exports = async function singleFlight(key, fn) {
  if (inflight.has(key)) return inflight.get(key)

  const promise = (async () => fn())().finally(() => {
    inflight.delete(key)
  })

  inflight.set(key, promise)
  return promise
}
