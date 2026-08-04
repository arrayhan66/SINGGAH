const { Notification } = require("../models")
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

  return {
    items: rows,
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
