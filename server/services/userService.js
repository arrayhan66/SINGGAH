const { User, Project, ProjectImage, sequelize } = require("../models")
const { Op } = require("sequelize")
const bcrypt = require("bcryptjs")
const AppError = require("../utils/AppError")
const { sendEmailAsync } = require("../utils/sendEmail")
const notificationService = require("./notificationService")
const {
  tipeApprovalEmail,
} = require("../utils/emailTemplate")
const { deleteImage, getPublicIdFromUrl } = require("../utils/uploadToCloudinary")

const VALID_ROLES = ["admin", "user"]
const VALID_TIPES = ["admin", "mahasiswa", "dosen", "umum"]
const VALID_STATUSES = ["active", "inactive"]

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

exports.getUsers = async (query = {}) => {
  const { page, limit, verification, username } = query

  const currentPage = parseInt(page) || 1
  const currentLimit = parseInt(limit) || 10
  const offset = (currentPage - 1) * currentLimit

  const where = {}

  if (verification === "pending") {
    where.pending_tipe = { [Op.ne]: null }
  }

  if (username) {
    where.username = String(username).trim().toLowerCase()
  }

  const { count, rows } = await User.findAndCountAll({
    attributes: {
      exclude: ["password"],
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM projects WHERE projects.user_id = User.id)",
          ),
          "projectCount",
        ],
      ],
    },
    where,
    order: [["created_at", "DESC"]],
    limit: currentLimit,
    offset,
  })

  return {
    items: rows,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count,
      totalPages: Math.ceil(count / currentLimit),
    },
  }
}

exports.getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: {
      exclude: ["password"],
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM projects WHERE projects.user_id = User.id)",
          ),
          "projectCount",
        ],
      ],
    },
  })

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  return user
}

exports.approveTipe = async (id, approved, reason) => {
  const user = await User.findByPk(id)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  if (!user.pending_tipe) {
    throw new AppError("Tidak ada permintaan verifikasi tipe untuk user ini", 400)
  }

  if (!approved && !reason) {
    throw new AppError("Alasan penolakan wajib diisi", 400)
  }

  const requestedTipe = user.pending_tipe

  if (approved) {
    user.tipe = requestedTipe
    user.pending_tipe = null
    user.rejection_reason = null
    await user.save()
  } else {
    user.pending_tipe = null
    user.rejection_reason = reason

    if (user.identitas_photo) {
      const publicId = getPublicIdFromUrl(user.identitas_photo)
      if (publicId) {
        await deleteImage(publicId).catch(() => {})
      }
      user.identitas_photo = null
    }

    user.nim_nip = null
    await user.save()
  }

  sendEmailAsync({
    to: user.email,
    subject: approved
      ? `Verifikasi Tipe Disetujui - ${user.name}`
      : `Verifikasi Tipe Ditolak - ${user.name}`,
    ...tipeApprovalEmail({
      name: user.name,
      approved,
      tipe: requestedTipe,
      reason,
    }),
  })

  try {
    await notificationService.createNotification({
      user_id: user.id,
      type: approved ? "tipe_approved" : "tipe_rejected",
      title: `Verifikasi Tipe ${approved ? "Disetujui" : "Ditolak"}`,
      message: approved
        ? `Tipe akun Anda telah disetujui menjadi ${requestedTipe}.`
        : `Permintaan verifikasi tipe ${requestedTipe} Anda ditolak: ${reason}`,
      reference_type: "user",
      reference_id: user.id,
    })
  } catch (err) {
    console.error("Gagal mengirim notifikasi verifikasi tipe:", err.message)
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tipe: user.tipe,
    pending_tipe: user.pending_tipe,
    requested_tipe: requestedTipe,
    identitas_photo: user.identitas_photo,
    nim_nip: user.nim_nip,
    rejection_reason: user.rejection_reason,
    approved,
  }
}

exports.createUser = async (data) => {
  const {
    name,
    username,
    email,
    password,
    avatar,
    nim_nip,
    tipe,
    role,
    status,
  } = data

  if (!name || !username || !email || !password) {
    throw new AppError("Nama, username, email, dan password wajib diisi", 400)
  }

  if (String(password).length < 8) {
    throw new AppError("Password minimal 8 karakter", 400)
  }

  const normalizedRole = VALID_ROLES.includes(role) ? role : "user"
  const normalizedTipe = VALID_TIPES.includes(tipe) ? tipe : "umum"
  const normalizedStatus = VALID_STATUSES.includes(status) ? status : "active"

  const normalizedUsername = String(username).trim().toLowerCase()
  const normalizedEmail = String(email).trim().toLowerCase()

  const emailExists = await User.findOne({
    where: {
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
  })

  if (emailExists) {
    throw new AppError("Email sudah digunakan", 400)
  }

  const usernameExists = await User.findOne({
    where: {
      username: normalizedUsername,
    },
  })

  if (usernameExists) {
    throw new AppError("Username sudah digunakan", 400)
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    avatar: avatar || null,
    nim_nip: nim_nip || null,
    tipe: normalizedTipe,
    role: normalizedRole,
    status: normalizedStatus,
    is_verified: true,
  })

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    nim_nip: user.nim_nip,
    tipe: user.tipe,
    role: user.role,
    status: user.status,
  }
}

exports.updateUser = async (id, data) => {
  const {
    name,
    username,
    email,
    password,
    avatar,
    nim_nip,
    tipe,
    role,
    status,
    is_verified,
  } = data

  const user = await User.findByPk(id)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  const wasAdmin = user.role === "admin"
  const normalizedEmail = email
    ? String(email).trim().toLowerCase()
    : String(user.email).trim().toLowerCase()
  const normalizedUsername = username
    ? String(username).trim().toLowerCase()
    : String(user.username).trim().toLowerCase()

  const isEmailChanged =
    normalizedEmail !== String(user.email).trim().toLowerCase()
  const isUsernameChanged =
    normalizedUsername !== String(user.username).trim().toLowerCase()

  try {
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
            { id: { [Op.ne]: id } },
          ],
        },
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
            { id: { [Op.ne]: id } },
          ],
        },
      })

      if (usernameExists) {
        throw new AppError("Username sudah digunakan", 400)
      }
    }

    user.name = name ?? user.name
    user.username = normalizedUsername
    user.role = VALID_ROLES.includes(role) ? role : user.role
    user.status = VALID_STATUSES.includes(status) ? status : user.status
    user.avatar = avatar ?? user.avatar
    user.nim_nip = nim_nip ?? user.nim_nip
    user.tipe = VALID_TIPES.includes(tipe) ? tipe : user.tipe
    user.is_verified = is_verified ?? user.is_verified

    if (isEmailChanged) {
      user.email = normalizedEmail
      user.pending_email = null
      user.is_verified = true
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10)
    }

    const demotingSelfOrLastAdmin =
      wasAdmin && (user.role !== "admin" || user.status === "inactive")

    if (demotingSelfOrLastAdmin) {
      const adminCount = await User.count({ where: { role: "admin" } })
      if (adminCount <= 1) {
        throw new AppError(
          "Tidak dapat menonaktifkan atau menurunkan admin terakhir",
          400,
        )
      }
    }

    await user.save()
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      throw new AppError("Email atau username sudah digunakan", 400)
    }
    throw err
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    nim_nip: user.nim_nip,
    tipe: user.tipe,
    role: user.role,
    status: user.status,
  }
}

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id)

  if (!user) {
    throw new AppError("User tidak ditemukan", 404)
  }

  if (user.role === "admin") {
    const adminCount = await User.count({ where: { role: "admin" } })

    if (adminCount <= 1) {
      throw new AppError("Tidak dapat menghapus admin terakhir", 400)
    }
  }

  await deleteUserStoredAssets(id)
  await user.destroy()

  return true
}
