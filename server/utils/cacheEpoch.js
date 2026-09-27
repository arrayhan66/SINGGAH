// Epoch invalidasi cache.
//
// Satu request yang sedang membangun nilai cache (SELECT berat) bisa selesai
// SETELAH perubahan data masuk dan cache di-purge. Kalau hasil lamanya tetap
// ditulis balik, cache terisi data basi lagi selama TTL penuh. Gejalanya di UI
// persis seperti yang dilaporkan: perubahan admin "tidak nyangkut" — status
// tombol kembali ke nilai lama, harus diklik berkali-kali, atau baru berubah
// setelah beberapa detik saat TTL habis.
//
// Solusinya: setiap purge menaikkan epoch. Build yang dimulai sebelum epoch
// berubah tidak boleh menulis hasilnya, karena SQL-nya sudah jalan dengan
// snapshot lama.
let epoch = 0

exports.bump = () => {
  epoch += 1
  return epoch
}

exports.current = () => epoch
