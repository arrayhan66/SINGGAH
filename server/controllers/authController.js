const authService = require("../services/authService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body)
  success(
    res,
    user,
    "Registrasi berhasil, silakan cek email untuk kode verifikasi",
    201,
  )
})

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  success(res, result, "Login berhasil")
})

exports.verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body)
  success(res, null, "Email berhasil diverifikasi, silakan login")
})

exports.resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body)
  success(res, null, "Kode verifikasi baru telah dikirim ke email Anda")
})

exports.me = asyncHandler(async (req, res) => {
  success(res, req.user)
})

exports.forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body)
  success(res, null, "Kode reset password telah dikirim ke email Anda")
})

exports.verifyResetCode = asyncHandler(async (req, res) => {
  await authService.verifyResetCode(req.body)

  success(res, null, "Kode valid, silakan buat password baru")
})

exports.resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body)
  success(
    res,
    null,
    "Password berhasil direset, silakan login dengan password baru",
  )
})

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body)
  success(res, null, "Password berhasil diubah")
})

exports.getProfileStats = asyncHandler(async (req, res) => {
  const stats = await authService.getProfileStats(req.user.id)
  success(res, stats)
})

exports.updateProfile = asyncHandler(async (req, res) => {
  let avatarUrl

  if (req.file) {
    const result = await uploadImage(req.file.buffer, "pamerit/avatars")
    avatarUrl = result.secure_url

    const oldAvatar = req.user.avatar

    if (oldAvatar) {
      const publicId = getPublicIdFromUrl(oldAvatar)

      if (publicId) {
        await deleteImage(publicId).catch(() => {})
      }
    }
  }

  const user = await authService.updateProfile(req.user.id, req.body, avatarUrl)
  success(res, user, "Profil berhasil diperbarui")
})

exports.deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.id, req.body.password)
  success(res, null, "Akun berhasil dihapus")
})
