const { Notification, User } = require("../models")
const { Op } = require("sequelize")
const AppError = require("../utils/AppError")

exports.getMyNotifications = async (userId, query) => {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  const offset = (page - 1) * limit

  const { count, rows } = await Notification.findAndCountAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  })

  const unreadCount = await Notification.count({
    where: { user_id: userId, is_read: false },
  })

  return {
    items: rows,
    unreadCount,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  }
}

exports.markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  })

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan", 404)
  }

  notification.is_read = true
  await notification.save()

  return notification
}

exports.markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } },
  )

  return true
}

exports.markAsUnread = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  })

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan", 404)
  }

  notification.is_read = false
  await notification.save()

  return notification
}

exports.deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  })

  if (!notification) {
    throw new AppError("Notifikasi tidak ditemukan", 404)
  }

  await notification.destroy()
  return true
}

exports.deleteAllNotifications = async (userId) => {
  await Notification.destroy({ where: { user_id: userId } })
  return true
}

exports.bulkUpdateNotifications = async (userId, ids, action) => {
  const [affectedCount] = await Notification.update(
    { is_read: action === "read" },
    { where: { id: ids, user_id: userId } },
  )

  return affectedCount
}

exports.bulkDeleteNotifications = async (userId, ids) => {
  const affectedCount = await Notification.destroy({
    where: { id: ids, user_id: userId },
  })

  return affectedCount
}

// Dipanggil dari service lain (Comment, Like, Project approve/reject, dll),
// bukan langsung dari Controller.
exports.createNotification = async (
  {
    user_id,
    type,
    title,
    message,
    reference_type = null,
    reference_id = null,
  },
  options = {},
) => {
  return await Notification.create(
    {
      user_id,
      type,
      title,
      message,
      reference_type,
      reference_id,
    },
    options,
  )
}

// Kirim notifikasi ke SEMUA admin (misal: ada project baru menunggu approval).
exports.notifyAdmins = async (
  { type, title, message, reference_type = null, reference_id = null },
  options = {},
) => {
  const admins = await User.findAll({
    where: { role: "admin" },
    attributes: ["id"],
    raw: true,
  })

  if (admins.length === 0) return 0

  return await Notification.bulkCreate(
    admins.map((admin) => ({
      user_id: admin.id,
      type,
      title,
      message,
      reference_type,
      reference_id,
    })),
    options,
  )
}

// Kirim pengumuman ke semua user (atau dikelompokkan berdasarkan tipe).
// Dipanggil dari controller (khusus admin).
exports.sendAnnouncement = async ({
  title,
  message,
  audience = "all",
  reference_type = null,
  reference_id = null,
}) => {
  if (!title || !title.trim() || !message || !message.trim()) {
    throw new AppError("Judul dan pesan wajib diisi", 400)
  }

  const where = { status: "active" }

  if (audience === "all") {
    // all active users, no extra filter
  } else if (audience === "admin") {
    where.role = "admin"
  } else if (["mahasiswa", "dosen"].includes(audience)) {
    where[Op.or] = [{ tipe: audience }, { pending_tipe: audience }]
  } else if (audience === "umum") {
    where[Op.and] = [
      { [Op.or]: [{ tipe: "umum" }, { pending_tipe: "umum" }] },
      { role: { [Op.ne]: "admin" } },
    ]
  } else {
    throw new AppError("audience tidak valid", 400)
  }

  const users = await User.findAll({
    where,
    attributes: ["id"],
    raw: true,
  })

  if (users.length === 0) {
    return { affected: 0 }
  }

  await Notification.bulkCreate(
    users.map((user) => ({
      user_id: user.id,
      type: "announcement",
      title: title.trim(),
      message: message.trim(),
      reference_type,
      reference_id,
    })),
  )

  return { affected: users.length }
}
