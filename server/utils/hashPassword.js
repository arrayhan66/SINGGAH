const bcrypt = require("bcryptjs")

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed)
}

module.exports = { hashPassword, comparePassword }
