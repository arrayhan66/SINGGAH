const notificationService = require("../services/notificationService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const AppError = require("../utils/AppError")

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getMyNotifications(
    req.user.id,
    req.query,
  )
  return success(res, result, "Berhasil mengambil notifikasi")
})

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user.id,
    req.params.id,
  )
  return success(res, notification, "Notifikasi ditandai sudah dibaca")
})

exports.markAsUnread = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsUnread(
    req.user.id,
    req.params.id,
  )
  return success(res, notification, "Notifikasi ditandai belum dibaca")
})

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id)
  return success(res, null, "Semua notifikasi ditandai sudah dibaca")
})

exports.deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user.id, req.params.id)
  return success(res, null, "Notifikasi dihapus")
})

exports.deleteAllNotifications = asyncHandler(async (req, res) => {
  await notificationService.deleteAllNotifications(req.user.id)
  return success(res, null, "Semua notifikasi dihapus")
})

exports.bulkUpdate = asyncHandler(async (req, res) => {
  const { ids, action } = req.body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids harus berupa array yang tidak kosong", 400)
  }
  if (!["read", "unread"].includes(action)) {
    throw new AppError("action harus bernilai 'read' atau 'unread'", 400)
  }

  const affected = await notificationService.bulkUpdateNotifications(
    req.user.id,
    ids,
    action,
  )
  return success(res, { affected }, `Berhasil memperbarui ${affected} notifikasi`)
})

exports.bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("ids harus berupa array yang tidak kosong", 400)
  }

  const affected = await notificationService.bulkDeleteNotifications(
    req.user.id,
    ids,
  )
  return success(res, { affected }, `Berhasil menghapus ${affected} notifikasi`)
})

exports.sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience, reference_type, reference_id } =
    req.body || {}

  const result = await notificationService.sendAnnouncement({
    title,
    message,
    audience,
    reference_type,
    reference_id,
  })

  return success(
    res,
    result,
    `Pengumuman terkirim ke ${result.affected} pengguna`,
  )
})
