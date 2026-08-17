const userService = require("../services/userService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const { logActivity } = require("../services/activityLogService")

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers(req.query)

  success(res, users)
})

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)

  success(res, user)
})

exports.createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body)

  await logActivity({
    userId: req.user.id,
    action: "user_created",
    targetType: "user",
    targetId: user.id,
    description: `${req.user.name} membuat user "${user.name}"`,
  })

  success(res, user, "User berhasil dibuat", 201)
})

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body)

  await logActivity({
    userId: req.user.id,
    action: "user_updated",
    targetType: "user",
    targetId: user.id,
    description: `${req.user.name} memperbarui user "${user.name}"`,
  })

  success(res, user, "User berhasil diperbarui")
})

exports.approveTipe = asyncHandler(async (req, res) => {
  const approved = req.body.approved === true
  const result = await userService.approveTipe(
    req.params.id,
    approved,
    req.body.reason,
  )

  await logActivity({
    userId: req.user.id,
    action: approved ? "user_tipe_approved" : "user_tipe_rejected",
    targetType: "user",
    targetId: result.id,
    description: `${req.user.name} ${
      approved ? "menyetujui" : "menolak"
    } verifikasi tipe ${result.requested_tipe} untuk "${result.name}"`,
  })

  success(
    res,
    result,
    approved
      ? "Verifikasi tipe berhasil disetujui"
      : "Verifikasi tipe berhasil ditolak",
  )
})

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id)

  await userService.deleteUser(req.params.id)

  await logActivity({
    userId: req.user.id,
    action: "user_deleted",
    targetType: "user",
    targetId: req.params.id,
    description: `${req.user.name} menghapus user "${user.name}"`,
  })

  success(res, null, "User berhasil dihapus")
})
