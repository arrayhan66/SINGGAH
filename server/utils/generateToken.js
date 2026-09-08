const jwt = require("jsonwebtoken")

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    },
  )
}

module.exports = generateToken
