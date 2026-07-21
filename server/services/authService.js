const {
  User,
  PasswordReset,
  VerificationCode,
  sequelize,
} = require("../models")
const bcrypt = require("bcryptjs")
const generateToken = require("../utils/generateToken")
const generateCode = require("../utils/generateCode")
const sendEmail = require("../utils/sendEmail")
const AppError = require("../utils/AppError")

const CODE_EXPIRES_MINUTES = 5

exports.login = async (data) => {
  const { email, password } = data

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email atau password salah", 401)
  }

  if (user.status !== "active") {
    throw new AppError("Akun Anda dinonaktifkan. Silakan hubungi admin.", 403)
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new AppError("Email atau password salah", 401)
  }

  if (!user.is_verified) {
    throw new AppError(
      "Email belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.",
      403,
    )
  }

  const token = generateToken(user)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      tipe: user.tipe,
      avatar: user.avatar,
    },
  }
}

exports.register = async (data) => {
  const { name, username, email, password } = data

  if (!name || !username || !email || !password) {
    throw new AppError("Semua field wajib diisi", 400)
  }

  const emailExists = await User.findOne({ where: { email } })
  if (emailExists) {
    throw new AppError("Email sudah digunakan", 400)
  }

  const usernameExists = await User.findOne({ where: { username } })
  if (usernameExists) {
    throw new AppError("Username sudah digunakan", 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  const user = await sequelize.transaction(async (t) => {
    const newUser = await User.create(
      {
        name,
        username,
        email,
        password: hashedPassword,
        tipe: "mahasiswa",
        is_verified: false,
      },
      { transaction: t },
    )

    await VerificationCode.create(
      {
        code,
        expires_at: expiresAt,
        user_id: newUser.id,
      },
      { transaction: t },
    )

    return newUser
  })

  try {
    await sendEmail({
      to: user.email,
      subject: "Kode Verifikasi Email - PamerIT",
      html: `
        <p>Halo ${user.name},</p>
        <p>Terima kasih sudah mendaftar di PamerIT. Kode verifikasi email Anda:</p>
        <h2>${code}</h2>
        <p>Kode berlaku selama ${CODE_EXPIRES_MINUTES} menit.</p>
      `,
    })
  } catch (err) {
    console.error("Gagal mengirim email verifikasi:", err.message)
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
  }
}

exports.verifyEmail = async (data) => {
  const { email, code } = data

  if (!email || !code) {
    throw new AppError("Email dan kode wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  if (user.is_verified) {
    throw new AppError("Email sudah terverifikasi", 400)
  }

  const verificationCode = await VerificationCode.findOne({
    where: { user_id: user.id },
    order: [["created_at", "DESC"]],
  })

  if (!verificationCode) {
    throw new AppError("Kode tidak ditemukan, silakan minta kode baru", 400)
  }

  if (verificationCode.code !== code) {
    throw new AppError("Kode salah", 400)
  }

  if (new Date() > verificationCode.expires_at) {
    throw new AppError("Kode sudah kadaluarsa, silakan minta kode baru", 400)
  }

  user.is_verified = true
  await user.save()

  await VerificationCode.destroy({ where: { user_id: user.id } })

  return true
}

exports.resendVerification = async (data) => {
  const { email } = data

  if (!email) {
    throw new AppError("Email wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  if (user.is_verified) {
    throw new AppError("Email sudah terverifikasi", 400)
  }

  await VerificationCode.destroy({ where: { user_id: user.id } })

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  await VerificationCode.create({
    code,
    expires_at: expiresAt,
    user_id: user.id,
  })

  await sendEmail({
    to: user.email,
    subject: "Kode Verifikasi Email - PamerIT",
    html: `
      <p>Halo ${user.name},</p>
      <p>Kode verifikasi email baru Anda:</p>
      <h2>${code}</h2>
      <p>Kode berlaku selama ${CODE_EXPIRES_MINUTES} menit.</p>
    `,
  })

  return true
}

exports.forgotPassword = async (data) => {
  const { email } = data

  if (!email) {
    throw new AppError("Email wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  await PasswordReset.destroy({ where: { user_id: user.id } })

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  await PasswordReset.create({
    code,
    expires_at: expiresAt,
    user_id: user.id,
  })

  await sendEmail({
    to: user.email,
    subject: "Kode Reset Password - PamerIT",
    html: `
      <p>Halo ${user.name},</p>
      <p>Kode reset password Anda:</p>
      <h2>${code}</h2>
      <p>Kode berlaku selama ${CODE_EXPIRES_MINUTES} menit. Abaikan email ini jika Anda tidak meminta reset password.</p>
    `,
  })

  return true
}

exports.verifyResetCode = async (data) => {
  const { email, code } = data

  if (!email || !code) {
    throw new AppError("Email dan kode wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  const resetRecord = await PasswordReset.findOne({
    where: { user_id: user.id },
    order: [["created_at", "DESC"]],
  })

  if (!resetRecord) {
    throw new AppError("Kode tidak ditemukan, silakan minta kode baru", 400)
  }

  if (resetRecord.code !== code) {
    throw new AppError("Kode salah", 400)
  }

  if (new Date() > resetRecord.expires_at) {
    throw new AppError("Kode sudah kadaluarsa, silakan minta kode baru", 400)
  }

  return true
}

exports.resetPassword = async (data) => {
  const { email, code, newPassword } = data

  if (!email || !code || !newPassword) {
    throw new AppError("Email, kode, dan password baru wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  const resetRecord = await PasswordReset.findOne({
    where: { user_id: user.id },
    order: [["created_at", "DESC"]],
  })

  if (!resetRecord) {
    throw new AppError("Kode tidak ditemukan, silakan minta kode baru", 400)
  }

  if (resetRecord.code !== code) {
    throw new AppError("Kode salah", 400)
  }

  if (new Date() > resetRecord.expires_at) {
    throw new AppError("Kode sudah kadaluarsa, silakan minta kode baru", 400)
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  await PasswordReset.destroy({ where: { user_id: user.id } })

  return true
}

exports.changePassword = async (userId, data) => {
  const { oldPassword, newPassword } = data

  if (!oldPassword || !newPassword) {
    throw new AppError("Password lama dan password baru wajib diisi", 400)
  }

  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password)

  if (!isMatch) {
    throw new AppError("Password lama salah", 400)
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save()

  return true
}
