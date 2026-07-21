const notificationService = require("../services/notificationService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

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

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id)
  return success(res, null, "Semua notifikasi ditandai sudah dibaca")
})
