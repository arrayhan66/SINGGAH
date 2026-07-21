const userService = require("../services/userService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

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

  success(res, user, "User berhasil dibuat", 201)
})

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body)

  success(res, user, "User berhasil diperbarui")
})

exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id)

  success(res, null, "User berhasil dihapus")
})
