const jwt = require("jsonwebtoken")
const { User } = require("../models")

// Auth opsional: jika token valid, isi req.user. Jika tidak ada/rusak, lanjut
// dengan req.user = null (route tetap publik). Dipakai route yang ingin tahu
// status like/bookmark user tanpa memaksa login.
async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null
      return next()
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ["password"],
      },
    })

    req.user = user || null
  } catch (error) {
    req.user = null
  }

  next()
}

module.exports = optionalAuthMiddleware
