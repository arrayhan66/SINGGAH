const {
  User,
  PasswordReset,
  VerificationCode,
  Project,
  ProjectImage,
  sequelize,
} = require("../models")
const bcrypt = require("bcryptjs")
const dns = require("dns").promises
const { Op } = require("sequelize")
const generateToken = require("../utils/generateToken")
const generateCode = require("../utils/generateCode")
const { sendEmailAsync } = require("../utils/sendEmail")
const {
  verificationEmail,
  emailChangeEmail,
  resetPasswordEmail,
  welcomeEmail,
} = require("../utils/emailTemplate")
const AppError = require("../utils/AppError")
const logger = require("../utils/logger")
const {
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const { logActivity } = require("./activityLogService")
const settingService = require("./settingService")
const notificationService = require("./notificationService")
const { verifyGoogleToken } = require("./googleAuthService")

const CODE_EXPIRES_MINUTES = 5

const KNOWN_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.id",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "gmx.com",
  "protonmail.com",
  "ymail.com",
  "live.com",
  "mail.com",
]

function levenshtein(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = curr
  }
  return prev[b.length]
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`)
}

async function findEmailSuggestion(email) {
  const parts = String(email).split("@")
  const local = parts[0] || ""
  const domain = parts[1] || ""

  if (!domain) return null

  let best = null
  let bestDist = 2

  const typedDomainIsKnown = KNOWN_EMAIL_DOMAINS.includes(domain)

  if (!typedDomainIsKnown) {
    let matched = null
    let matchedDist = 2

    for (const known of KNOWN_EMAIL_DOMAINS) {
      if (known === domain) continue
      const d = levenshtein(domain, known)
      if (d < matchedDist) {
        matchedDist = d
        matched = known
      }
    }

    if (matchedDist <= 1) {
      return `${local}@${matched}`
    }
  }

  if (typedDomainIsKnown) return null

  const candidates = await User.findAll({
    where: {
      email: { [Op.like]: `%@${escapeLike(domain)}` },
    },
    attributes: ["email"],
    order: [["updated_at", "DESC"]],
    limit: 100,
    raw: true,
  })

  for (const c of candidates) {
    const ce = String(c.email).toLowerCase()
    if (ce === email) continue
    const d = levenshtein(email, ce)
    if (d <= 1 && d < bestDist) {
      bestDist = d
      best = ce
    }
  }

  return best
}

const deleteUserStoredAssets = async (userId) => {
  const projects = await Project.findAll({
    where: { user_id: userId },
    include: [
      {
        model: ProjectImage,
        as: "images",
        attributes: ["image_url"],
      },
    ],
    attributes: ["thumbnail"],
  })

  const publicIds = []

  projects.forEach((project) => {
    const thumbnailId = getPublicIdFromUrl(project.thumbnail)
    if (thumbnailId) publicIds.push(thumbnailId)

    if (project.images && project.images.length > 0) {
      project.images.forEach((image) => {
        const imageId = getPublicIdFromUrl(image.image_url)
        if (imageId) publicIds.push(imageId)
      })
    }
  })

  await Promise.all(
    publicIds.map((publicId) => deleteImage(publicId).catch(() => {})),
  )
}

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

  if (user.pending_email) {
    throw new AppError(
      "Perubahan email belum diverifikasi. Silakan verifikasi email baru Anda terlebih dahulu.",
      403,
      { pending_email: user.pending_email },
    )
  }

  const maintenance = await settingService.getSetting("maintenanceMode")

  if (maintenance && user.role !== "admin") {
    throw new AppError(
      "Mode maintenance sedang aktif. Silakan coba lagi nanti.",
      503,
    )
  }

  const token = generateToken(user)

  await logActivity({
    userId: user.id,
    action: "user_login",
    description: `${user.name} login ke sistem`,
  })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      pending_email: user.pending_email,
      google_id: user.google_id,
      role: user.role,
      tipe: user.tipe,
      pending_tipe: user.pending_tipe,
      rejection_reason: user.rejection_reason,
      nim_nip: user.nim_nip,
      avatar: user.avatar,
      identitas_photo: user.identitas_photo,
      status: user.status,
      is_verified: user.is_verified,
      created_at: user.created_at,
    },
  }
}

const resolveMxWithTimeout = async (domain, ms = 4000) => {
  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("mx timeout")), ms),
      ),
    ])
    return Array.isArray(records) && records.length > 0
  } catch {
    return null
  }
}

exports.checkEmail = async (data) => {
  const rawEmail = String(data.email || "").trim()
  const email = rawEmail.toLowerCase()

  if (!email) throw new AppError("Email wajib diisi", 400)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("Format email tidak valid", 400)
  }

  const result = {
    exists: false,
    verified: false,
    tipe: null,
    suggestion: null,
    domain: null,
    domainValid: null,
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ email }, { pending_email: email }],
    },
  })

  if (user) {
    result.exists = true
    result.verified =
      user.is_verified && String(user.email).trim().toLowerCase() === email
    result.tipe = result.verified ? user.tipe : null
    return result
  }

  result.suggestion = await findEmailSuggestion(email)

  const domain = email.slice(email.indexOf("@") + 1)
  if (KNOWN_EMAIL_DOMAINS.includes(domain)) {
    result.domain = domain
    result.domainValid = true
  } else {
    const hasMx = await resolveMxWithTimeout(domain)
    result.domain = domain
    result.domainValid = hasMx === true
  }

  return result
}

exports.register = async (data) => {
  const {
    name,
    username,
    email,
    password,
    tipe = "umum",
    nim_nip,
    avatar,
    identitas_photo,
  } = data

  const registrationOpen = await settingService.getSetting("registrationOpen")
  if (registrationOpen === false) {
    throw new AppError("Pendaftaran akun baru sedang ditutup. Silakan coba lagi nanti.", 403)
  }

  if (!name || !username || !email || !password) {
    throw new AppError("Semua field wajib diisi", 400)
  }

  const normalizedUsername = String(username).trim().toLowerCase()

  const emailExists = await User.findOne({ where: { email } })
  if (emailExists) {
    throw new AppError("Email sudah digunakan", 400)
  }

  const usernameExists = await User.findOne({
    where: { username: normalizedUsername },
  })
  if (usernameExists) {
    throw new AppError("Username sudah digunakan", 400)
  }

  const validTipes = ["mahasiswa", "dosen", "umum"]
  const userTipe = validTipes.includes(tipe) ? tipe : "umum"

  const needsApproval = userTipe === "mahasiswa" || userTipe === "dosen"

  if (userTipe === "mahasiswa" && !nim_nip) {
    throw new AppError("NIM wajib diisi untuk pendaftaran mahasiswa", 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  const emailVerification = await settingService.getSetting("emailVerification")
  const requiresVerification = emailVerification !== false

  let user

  try {
    user = await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        {
          name,
          username: normalizedUsername,
          email,
          password: hashedPassword,
          tipe: needsApproval ? "umum" : userTipe,
          pending_tipe: needsApproval ? userTipe : null,
          nim_nip: nim_nip || null,
          avatar: avatar || null,
          identitas_photo: identitas_photo || null,
          is_verified: !requiresVerification,
        },
        { transaction: t },
      )

      if (requiresVerification) {
        await VerificationCode.create(
          {
            code,
            expires_at: expiresAt,
            user_id: newUser.id,
          },
          { transaction: t },
        )
      }

      return newUser
    })
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      throw new AppError("Email atau username sudah digunakan", 400)
    }
    throw err
  }

  await logActivity({
    userId: user.id,
    action: "user_registered",
    targetType: "user",
    targetId: user.id,
    description: `${user.name} mendaftar akun baru`,
  })

  if (needsApproval) {
    try {
      await notificationService.notifyAdmins({
        type: "user_registered",
        title: `Pendaftaran ${userTipe === "mahasiswa" ? "Mahasiswa" : "Dosen"} Baru`,
        message: `${user.name} (${user.username}) mengajukan verifikasi ${
          userTipe === "mahasiswa" ? "mahasiswa" : "dosen"
        } dengan ${userTipe === "mahasiswa" ? "NIM" : "NIP"} ${nim_nip || "-"}.`,
        reference_type: "user",
        reference_id: user.id,
      })
    } catch (err) {
      logger.error("Gagal mengirim notifikasi ke admin:", err.message)
    }
  }

  if (requiresVerification) {
    sendEmailAsync({
      to: user.email,
      subject: `Kode Verifikasi Email - ${user.name}`,
      ...verificationEmail({
        name: user.name,
        code,
        minutes: CODE_EXPIRES_MINUTES,
      }),
    })
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    tipe: user.tipe,
    pending_tipe: user.pending_tipe,
    nim_nip: user.nim_nip,
    identitas_photo: user.identitas_photo,
    is_verified: user.is_verified,
  }
}

exports.applyTipe = async (userId, tipe, nim_nip, identitasUrl) => {
  if (!["mahasiswa", "dosen"].includes(tipe)) {
    throw new AppError("Tipe tidak valid", 400)
  }

  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  if (user.tipe !== "umum") {
    throw new AppError(`Akun Anda sudah memiliki tipe ${user.tipe}`, 400)
  }

  if (user.pending_tipe) {
    throw new AppError(
      "Permintaan verifikasi tipe sedang menunggu persetujuan admin",
      400,
    )
  }

  if (!user.is_verified) {
    throw new AppError(
      "Verifikasi email Anda terlebih dahulu sebelum mengajukan tipe",
      400,
    )
  }

  const finalNimNip = nim_nip || user.nim_nip

  if (tipe === "mahasiswa" && !finalNimNip) {
    throw new AppError("NIM wajib diisi untuk pengajuan mahasiswa", 400)
  }

  const finalIdentitas = identitasUrl || user.identitas_photo

  if (!finalIdentitas) {
    throw new AppError(
      tipe === "mahasiswa"
        ? "Foto KTM wajib diunggah untuk pengajuan mahasiswa"
        : "Foto Kartu Identitas wajib diunggah untuk pengajuan dosen",
      400,
    )
  }

  user.nim_nip = finalNimNip
  user.identitas_photo = finalIdentitas
  user.pending_tipe = tipe
  user.rejection_reason = null
  await user.save()

  try {
    await notificationService.notifyAdmins({
      type: "user_registered",
      title: `Pengajuan ${tipe === "mahasiswa" ? "Mahasiswa" : "Dosen"} Baru`,
      message: `${user.name} (${user.username}) mengajukan verifikasi ${
        tipe === "mahasiswa" ? "mahasiswa" : "dosen"
      } dengan ${tipe === "mahasiswa" ? "NIM" : "NIP"} ${user.nim_nip}.`,
      reference_type: "user",
      reference_id: user.id,
    })
  } catch (err) {
    logger.error("Gagal mengirim notifikasi ke admin:", err.message)
  }

  return {
    id: user.id,
    name: user.name,
    tipe: user.tipe,
    pending_tipe: user.pending_tipe,
    rejection_reason: user.rejection_reason,
    nim_nip: user.nim_nip,
    identitas_photo: user.identitas_photo,
  }
}

exports.verifyEmail = async (data) => {
  const { email, code } = data

  if (!email || !code) {
    throw new AppError("Email dan kode wajib diisi", 400)
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedEmail },
        { pending_email: normalizedEmail },
      ],
    },
  })

  if (!user) {
    throw new AppError("Email tidak terdaftar", 404)
  }

  const hasPending =
    user.pending_email &&
    String(user.pending_email).trim().toLowerCase() === normalizedEmail

  if (user.is_verified && !hasPending) {
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

  await sequelize.transaction(async (t) => {
    if (hasPending) {
      user.email = user.pending_email
      user.pending_email = null
    }
    user.is_verified = true
    await user.save({ transaction: t })

    await VerificationCode.destroy({ where: { user_id: user.id }, transaction: t })
  })

  if (!hasPending) {
    sendEmailAsync({
      to: user.email,
      subject: `Selamat Bergabung di SINGGAH - ${user.name}`,
      ...welcomeEmail({
        name: user.name,
        username: user.username,
        tipe: user.pending_tipe || user.tipe,
      }),
    })
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    pending_email: user.pending_email,
    role: user.role,
    tipe: user.tipe,
    pending_tipe: user.pending_tipe,
    rejection_reason: user.rejection_reason,
    nim_nip: user.nim_nip,
    avatar: user.avatar,
    identitas_photo: user.identitas_photo,
    status: user.status,
    is_verified: user.is_verified,
    created_at: user.created_at,
  }
}

exports.resendVerification = async (data) => {
  const { email } = data

  if (!email) {
    throw new AppError("Email wajib diisi", 400)
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedEmail },
        { pending_email: normalizedEmail },
      ],
    },
  })

  // Anti-enumeration: balas sukses generik walau email tidak terdaftar.
  if (!user) {
    return true
  }

  const hasPending =
    user.pending_email &&
    String(user.pending_email).trim().toLowerCase() === normalizedEmail

  if (user.is_verified && !hasPending) {
    throw new AppError("Email sudah terverifikasi", 400)
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  await sequelize.transaction(async (t) => {
    await VerificationCode.destroy({ where: { user_id: user.id }, transaction: t })

    await VerificationCode.create(
      {
        code,
        expires_at: expiresAt,
        user_id: user.id,
      },
      { transaction: t },
    )
  })

  const targetEmail = hasPending ? user.pending_email : user.email

  sendEmailAsync({
    to: targetEmail,
    subject: `Kode Verifikasi Email - ${user.name}`,
    ...verificationEmail({
      name: user.name,
      code,
      minutes: CODE_EXPIRES_MINUTES,
    }),
  })

  return true
}

exports.forgotPassword = async (data) => {
  const { email } = data

  if (!email) {
    throw new AppError("Email wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  // Anti-enumeration: balas sukses generik walau email tidak terdaftar.
  if (!user) {
    return true
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000)

  await sequelize.transaction(async (t) => {
    await PasswordReset.destroy({ where: { user_id: user.id }, transaction: t })

    await PasswordReset.create(
      {
        code,
        expires_at: expiresAt,
        user_id: user.id,
      },
      { transaction: t },
    )
  })

  sendEmailAsync({
      to: user.email,
      subject: `Kode Reset Password - ${user.name}`,
      ...resetPasswordEmail({
        name: user.name,
        code,
        minutes: CODE_EXPIRES_MINUTES,
      }),
    })

  return true
}

exports.verifyResetCode = async (data) => {
  const { email, code } = data

  if (!email || !code) {
    throw new AppError("Email dan kode wajib diisi", 400)
  }

  const user = await User.findOne({ where: { email } })

  // Anti-enumeration: jangan ungkap status pendaftaran email.
  if (!user) {
    throw new AppError("Kode tidak valid atau sudah kadaluarsa", 400)
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

  // Anti-enumeration: jangan ungkap status pendaftaran email.
  if (!user) {
    throw new AppError("Kode tidak valid atau sudah kadaluarsa", 400)
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

  await sequelize.transaction(async (t) => {
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save({ transaction: t })

    await PasswordReset.destroy({ where: { user_id: user.id }, transaction: t })
  })

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

exports.getProfileStats = async (userId) => {
  const [published, pending, rejected, total] = await Promise.all([
    Project.count({ where: { user_id: userId, status: "published" } }),
    Project.count({ where: { user_id: userId, status: "pending" } }),
    Project.count({ where: { user_id: userId, status: "rejected" } }),
    Project.count({ where: { user_id: userId } }),
  ])

  return { published, pending, rejected, total }
}

exports.updateProfile = async (userId, data, avatarUrl, identitasUrl) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  const { name, username, email, nim_nip } = data

  const finalName = (name && name.trim()) || user.name

  if (!finalName || finalName.length < 3) {
    throw new AppError("Nama lengkap wajib diisi (minimal 3 karakter)", 400)
  }

  const normalizedUsername = username
    ? String(username).trim().toLowerCase()
    : String(user.username).trim().toLowerCase()

  if (!normalizedUsername) {
    throw new AppError("Username wajib diisi", 400)
  }

  if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
    throw new AppError(
      "Username hanya boleh huruf, angka, titik, underscore, dan strip",
      400,
    )
  }

  const normalizedEmail = email ? email.trim().toLowerCase() : user.email

  if (!normalizedEmail) {
    throw new AppError("Email wajib diisi", 400)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError("Format email tidak valid", 400)
  }

  const currentEmail = String(user.email).trim().toLowerCase()
  const currentPending = user.pending_email
    ? String(user.pending_email).trim().toLowerCase()
    : null

  const isEmailChanged =
    normalizedEmail !== currentEmail && normalizedEmail !== currentPending
  const isUsernameChanged =
    normalizedUsername !== String(user.username).trim().toLowerCase()

  let savedUser

  try {
    savedUser = await sequelize.transaction(async (t) => {
      if (isEmailChanged) {
        const emailExists = await User.findOne({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("email")),
                    normalizedEmail,
                  ),
                  sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("pending_email")),
                    normalizedEmail,
                  ),
                ],
              },
              { id: { [Op.ne]: userId } },
            ],
          },
          transaction: t,
        })

        if (emailExists) {
          throw new AppError("Email sudah digunakan", 400)
        }
      }

      if (isUsernameChanged) {
        const usernameExists = await User.findOne({
          where: {
            [Op.and]: [
              sequelize.where(
                sequelize.fn("LOWER", sequelize.col("username")),
                normalizedUsername,
              ),
              { id: { [Op.ne]: userId } },
            ],
          },
          transaction: t,
        })

        if (usernameExists) {
          throw new AppError("Username sudah digunakan", 400)
        }
      }

      user.name = finalName.trim()
      user.username = normalizedUsername
      user.nim_nip = nim_nip ? nim_nip.trim() : user.nim_nip

      if (avatarUrl !== undefined) {
        user.avatar = avatarUrl
      }

      if (identitasUrl !== undefined) {
        user.identitas_photo = identitasUrl
      }

      if (isEmailChanged) {
        user.pending_email = normalizedEmail

        const code = generateCode()
        const expiresAt = new Date(
          Date.now() + CODE_EXPIRES_MINUTES * 60 * 1000,
        )

        await VerificationCode.destroy({
          where: { user_id: userId },
          transaction: t,
        })

        await VerificationCode.create(
          {
            code,
            expires_at: expiresAt,
            user_id: userId,
          },
          { transaction: t },
        )
      }

      await user.save({ transaction: t })

      return user
    })
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      throw new AppError("Email atau username sudah digunakan", 400)
    }
    throw err
  }

  if (isEmailChanged) {
    try {
      const verificationRecord = await VerificationCode.findOne({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
      })

      sendEmailAsync({
        to: savedUser.pending_email,
        subject: `Verifikasi Email Baru - ${savedUser.name}`,
        ...emailChangeEmail({
          name: savedUser.name,
          code: verificationRecord?.code || "",
          minutes: CODE_EXPIRES_MINUTES,
        }),
      })
    } catch (err) {
      logger.error("Gagal mengirim email verifikasi email baru:", err.message)
    }
  }

  return {
    id: savedUser.id,
    name: savedUser.name,
    username: savedUser.username,
    email: savedUser.email,
    pending_email: savedUser.pending_email,
    role: savedUser.role,
    tipe: savedUser.tipe,
    avatar: savedUser.avatar,
    identitas_photo: savedUser.identitas_photo,
    nim_nip: savedUser.nim_nip,
    status: savedUser.status,
    is_verified: savedUser.is_verified,
    created_at: savedUser.created_at,
    email_changed: isEmailChanged,
  }
}

exports.deleteAccount = async (userId, password) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  if (user.role === "admin") {
    const adminCount = await User.count({ where: { role: "admin" } })

    if (adminCount <= 1) {
      throw new AppError("Tidak dapat menghapus admin terakhir", 400)
    }
  }

  const isMatch = await bcrypt.compare(password || "", user.password)

  if (!isMatch) {
    throw new AppError("Password salah", 400)
  }

  await deleteUserStoredAssets(userId)
  await user.destroy()

  return true
}

const buildAuthPayload = (user) => ({
  token: generateToken(user),
  user: {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    pending_email: user.pending_email,
    google_id: user.google_id,
    role: user.role,
    tipe: user.tipe,
    pending_tipe: user.pending_tipe,
    rejection_reason: user.rejection_reason,
    nim_nip: user.nim_nip,
    avatar: user.avatar,
    identitas_photo: user.identitas_photo,
    status: user.status,
    is_verified: user.is_verified,
    created_at: user.created_at,
  },
})

const STUDENT_EMAIL_DOMAINS = ["mahasiswa.poliban.ac.id"]
const STAFF_EMAIL_DOMAINS = ["dosen.poliban.ac.id", "poliban.ac.id"]

const inferTipeFromEmail = (email) => {
  const lower = String(email || "").trim().toLowerCase()
  const at = lower.lastIndexOf("@")
  if (at <= 0) return { userTipe: "umum", nimNip: null }

  const local = lower.slice(0, at)
  const domain = lower.slice(at + 1)

  if (STUDENT_EMAIL_DOMAINS.includes(domain)) {
    const nim = local.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
    return { userTipe: "mahasiswa", nimNip: nim || null }
  }

  if (STAFF_EMAIL_DOMAINS.includes(domain)) {
    const nip = local.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
    return { userTipe: "dosen", nimNip: nip || null }
  }

  return { userTipe: "umum", nimNip: null }
}

exports.googleLogin = async (data) => {
  const idToken = String(data.idToken || "").trim()

  if (!idToken) {
    throw new AppError("Token Google tidak ditemukan", 400)
  }

  let payload
  try {
    payload = await verifyGoogleToken(idToken)
  } catch (err) {
    throw new AppError("Token Google tidak valid atau kedaluwarsa", 401)
  }

  if (!payload.email) {
    throw new AppError("Google tidak memberikan alamat email", 400)
  }

  const email = String(payload.email).toLowerCase()
  const googleId = String(payload.sub)

  const registrationOpen = await settingService.getSetting("registrationOpen")
  if (registrationOpen === false) {
    throw new AppError(
      "Pendaftaran akun baru sedang ditutup. Silakan coba lagi nanti.",
      403,
    )
  }

  const maintenance = await settingService.getSetting("maintenanceMode")
  if (maintenance) {
    throw new AppError("Mode maintenance sedang aktif. Silakan coba lagi nanti.", 503)
  }

  let user = await User.findOne({ where: { google_id: googleId } })

  if (!user) {
    user = await User.findOne({ where: { email } })
  }

  const isNewUser = !user

  if (!user) {
    const baseUsername = String(payload.name || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 20) || "user"

    let username = baseUsername
    const suffix = googleId.slice(-5).replace(/\D/g, "") || Date.now().toString().slice(-5)
    let attempt = 0
    let exists = await User.findOne({ where: { username } })
    while (exists && attempt < 10) {
      attempt += 1
      username = `${baseUsername}${suffix}${attempt}`.slice(0, 50)
      exists = await User.findOne({ where: { username } })
    }

    const { userTipe, nimNip } = inferTipeFromEmail(email)
    const needsApproval = false

    try {
      user = await sequelize.transaction(async (t) => {
        const created = await User.create(
          {
            name: String(payload.name || "Pengguna").slice(0, 100),
            username,
            email,
            google_id: googleId,
            password: require("bcryptjs").hashSync(
              `google_${googleId}_${Date.now()}`,
              10,
            ),
            avatar: payload.picture || null,
            tipe: userTipe,
            pending_tipe: needsApproval ? userTipe : null,
            nim_nip: nimNip,
            status: "active",
            is_verified: true,
          },
          { transaction: t },
        )
        return created
      })
    } catch (err) {
      // Race: username/email/google_id diambil proses lain di antara check & create.
      if (err.name === "SequelizeUniqueConstraintError") {
        const fallbackUsername = `${baseUsername}${Date.now().toString().slice(-6)}`.slice(0, 50)
        try {
          user = await sequelize.transaction(async (t) => {
            const created = await User.create(
              {
                name: String(payload.name || "Pengguna").slice(0, 100),
                username: fallbackUsername,
                email,
                google_id: googleId,
                password: require("bcryptjs").hashSync(
                  `google_${googleId}_${Date.now()}`,
                  10,
                ),
                avatar: payload.picture || null,
                tipe: userTipe,
                pending_tipe: null,
                nim_nip: nimNip,
                status: "active",
                is_verified: true,
              },
              { transaction: t },
            )
            return created
          })
        } catch (err2) {
          throw new AppError(
            "Gagal membuat akun, silakan coba lagi",
            err2.name === "SequelizeUniqueConstraintError" ? 409 : 500,
          )
        }
      } else {
        throw err
      }
    }

    await logActivity({
      userId: user.id,
      action: "user_registered",
      targetType: "user",
      targetId: user.id,
      description: `${user.name} mendaftar (Google)`,
    })
  } else {
    if (user.status !== "active") {
      throw new AppError(
        "Akun Anda dinonaktifkan. Silakan hubungi admin.",
        403,
      )
    }

    if (!user.google_id) {
      user.google_id = googleId
      await user.save().catch(() => {})
    }
  }

  if (isNewUser) {
    try {
      await notificationService.notifyAdmins({
        type: "user_registered",
        title: "Pendaftaran Baru (Google)",
        message: `${user.name} (${user.username}) mendaftar melalui Google.`,
        reference_type: "user",
        reference_id: user.id,
      })
    } catch (err) {
      logger.error("Gagal kirim notifikasi admin:", err.message)
    }
  }

  await logActivity({
    userId: user.id,
    action: "user_login",
    description: `${user.name} login melalui Google`,
  })

  return buildAuthPayload(user)
}
