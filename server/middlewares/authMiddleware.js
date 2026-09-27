const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { getTokenFromCookie } = require("../utils/authCookie")
const { isConnectionError, withDbRetry } = require("../utils/dbRetry")
const cache = require("../utils/cache")
const singleFlight = require("../utils/singleFlight")

// authMiddleware berjalan di hampir setiap request terautentikasi. Tanpa cache,
// satu User.findByPk per request hanya untuk cek role/status — itu jadi beban
// database terbesar di aplikasi. Cache 60 detik + invalidasi lewat hook model
// (models/User.js) supaya perubahan role/status tetap langsung berlaku.
const AUTH_CACHE_TTL_MS = Number(process.env.AUTH_CACHE_TTL_MS) || 60_000
const AUTH_CACHE_PREFIX = "auth:user:"

function authUserCacheKey(id) {
  return AUTH_CACHE_PREFIX + id
}

// Dipakai juga oleh maintenanceMiddleware, jadi diekspor.
async function loadUser(id) {
  const cacheKey = authUserCacheKey(id)

  const cached = await cache.get(cacheKey)
  if (cached) return cached

  return singleFlight(cacheKey, async () => {
    const afterWait = await cache.get(cacheKey)
    if (afterWait) return afterWait

    const user = await withDbRetry(() =>
      User.findByPk(id, {
        attributes: {
          exclude: ["password"],
        },
      }),
    )

    if (user) {
      // Simpan sebagai objek biasa (bukan instance Sequelize) supaya aman
      // di-serialize ke Redis dan tidak ikut ter-save saat req.user
      // dimodifikasi di handler.
      await cache.set(cacheKey, user.get({ plain: true }), AUTH_CACHE_TTL_MS)
    }

    return user
  })
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    let token = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else {
      token = getTokenFromCookie(req)
    }

    if (!token) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    let user
    try {
      user = await loadUser(decoded.id)
    } catch (error) {
      if (isConnectionError(error)) {
        return res.status(503).json({
          message: "Database sedang tidak dapat diakses. Silakan coba lagi.",
        })
      }
      throw error
    }

    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan",
      })
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Akun Anda dinonaktifkan. Silakan hubungi admin.",
      })
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
      })
    }

    req.user = user

    next()
  } catch (error) {
    if (isConnectionError(error)) {
      return res.status(503).json({
        message: "Database sedang tidak dapat diakses. Silakan coba lagi.",
      })
    }
    return res.status(401).json({
      message: "Token tidak valid",
    })
  }
}

// Versi opsional untuk endpoint yang elegan saat tamu maupun saat login:
// /auth/me misalnya — kalau tidak ada sesi, req.user = null lalu lanjut,
// sehingga tidak ada respon 401 noise di konsol browser saat belum login.
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    let token = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else {
      token = getTokenFromCookie(req)
    }

    if (!token) return next() // tamu → req.user null

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await loadUser(decoded.id)

    if (user && user.status === "active" && user.is_verified) {
      req.user = user
    }
  } catch (error) {
    if (isConnectionError(error)) {
      return res.status(503).json({
        message: "Database sedang tidak dapat diakses. Silakan coba lagi.",
      })
    }
    // token rusak/kadaluarsa → perlakukan sebagai tamu
  }

  next()
}

module.exports = authMiddleware
module.exports.optionalAuthMiddleware = optionalAuthMiddleware
module.exports.loadUser = loadUser
module.exports.authUserCacheKey = authUserCacheKey
