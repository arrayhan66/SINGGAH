const crypto = require("crypto")

// Kode verifikasi yang dikirim ke email (reset password, verifikasi akun).
//
// PENTING: pakai crypto.randomInt, BUKAN Math.random().
//
// Math.random() itu pseudo-random: output-nya bisa dihitung ulang oleh siapa
// saja yang tahu urutan pemanggilannya, karena underlying-nya cuma PRNG
// 48-bit yang di-seed sekali saat process start. Kode ini yang jadi satu-
//-satunya kunci sah untuk reset password, jadi harus pakai sumber acak
// kriptografis dari OS (crypto.randomInt). Node sendiri menandai
// Math.random() sebagai tidak aman untuk keperluan kriptografi.
//
// Batas bawah eksklusif dan batas atas eksklusif, jadi rentangnya 100000
// sampai 999999 (enam digit) -- sama seperti versi Math.random sebelumnya.
const generateCode = () => crypto.randomInt(100000, 1000000).toString()

module.exports = generateCode
