const rateLimit = require("express-rate-limit")

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
  },
})

exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
  },
})

exports.forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan reset password. Coba lagi dalam 15 menit.",
  },
})

exports.resendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan kode. Coba lagi dalam 15 menit.",
  },
})
