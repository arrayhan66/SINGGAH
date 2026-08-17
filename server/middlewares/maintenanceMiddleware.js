const jwt = require("jsonwebtoken")
const { User } = require("../models")
const settingService = require("../services/settingService")

const WHITELIST = [
  { method: "GET", path: "/api/settings" },
  { method: "POST", path: "/api/auth/login" },
]

function isWhitelisted(req) {
  const path = req.originalUrl.split("?")[0]

  return WHITELIST.some(
    (rule) => rule.method === req.method && path.startsWith(rule.path),
  )
}

async function maintenanceMiddleware(req, res, next) {
  try {
    const maintenance = await settingService.getSetting("maintenanceMode")

    if (!maintenance) {
      return next()
    }

    if (isWhitelisted(req)) {
      return next()
    }

    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET,
        )
        const user = await User.findByPk(decoded.id, {
          attributes: ["id", "role"],
        })

        if (user && user.role === "admin") {
          return next()
        }
      } catch {
        // token tidak valid / bukan admin -> lanjut ke blokir
      }
    }

    return res.status(503).json({
      success: false,
      message:
        "Mode maintenance sedang aktif. Website akan segera kembali, silakan coba lagi nanti.",
    })
  } catch {
    return next()
  }
}

module.exports = maintenanceMiddleware
