const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { getTokenFromCookie } = require("../utils/authCookie")

// Auth opsional: jika token valid, isi req.user. Jika tidak ada/rusak, lanjut
// dengan req.user = null (route tetap publik). Dipakai route yang ingin tahu
// status like/bookmark user tanpa memaksa login.
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    let token = null
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]
    } else {
      token = getTokenFromCookie(req)
    }

    if (!token) {
      req.user = null
      req.tokenInvalid = false
      return next()
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
    })

    if (!user) {
      req.user = null
      req.tokenInvalid = true
      return next()
    }

    req.user = user
    req.tokenInvalid = false

    next()
  } catch (error) {
    // Token rusak/kadaluarsa: anggap anonymous, tapi tandai agar route
    // privasi bisa balas 401 (session expired) alih-alih 404.
    req.user = null
    req.tokenInvalid = true
    next()
  }
}

module.exports = optionalAuthMiddleware
