const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { getTokenFromCookie } = require("../utils/authCookie")

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

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
    })

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
    return res.status(401).json({
      message: "Token tidak valid",
    })
  }
}

module.exports = authMiddleware
