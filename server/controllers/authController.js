const authService = require("../services/authService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const { saveLocalFile, deleteLocalFile } = require("../utils/localImage")

exports.register = asyncHandler(async (req, res) => {
  let avatarUrl
  let identitasUrl

  try {
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      const result = await saveLocalFile(req.files.avatar[0], "avatars")
      avatarUrl = result.url
    }

    if (req.files && req.files.identitas_photo && req.files.identitas_photo[0]) {
      const result = await saveLocalFile(req.files.identitas_photo[0], "identitas")
      identitasUrl = result.url
    }
    const user = await authService.register({
      ...req.body,
      avatar: avatarUrl,
      identitas_photo: identitasUrl,
    })

    success(
      res,
      user,
      "Registrasi berhasil, silakan cek email untuk kode verifikasi",
      201,
    )
  } catch (err) {
    await Promise.all(
      [avatarUrl, identitasUrl]
        .filter(Boolean)
        .map((url) => deleteLocalFile(url).catch(() => {})),
    )
    throw err
  }
})

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body)
  success(res, result, "Login berhasil")
})

exports.googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body)
  success(res, result, "Login Google berhasil")
})

exports.checkEmail = asyncHandler(async (req, res) => {
  const result = await authService.checkEmail(req.body)
  success(res, result, "Pengecekan email berhasil")
})

exports.verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body)
  success(res, user, "Email berhasil diverifikasi, silakan login")
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
  let identitasUrl

  try {
    const tasks = []

    if (req.files && req.files.avatar && req.files.avatar[0]) {
      tasks.push(
        saveLocalFile(req.files.avatar[0], "avatars").then(
          (r) => (avatarUrl = r.url),
        ),
      )
    }

    if (req.files && req.files.identitas_photo && req.files.identitas_photo[0]) {
      tasks.push(
        saveLocalFile(req.files.identitas_photo[0], "identitas").then(
          (r) => (identitasUrl = r.url),
        ),
      )
    }

    await Promise.all(tasks)

    const user = await authService.updateProfile(
      req.user.id,
      req.body,
      avatarUrl,
      identitasUrl,
    )

    // Hapus file lama HANYA setelah update DB/validasi sukses, supaya
    // kalau service throw (mis. email sudah dipakai) file lama tidak hilang.
    const deletions = []
    if (avatarUrl && req.user.avatar) {
      deletions.push(deleteLocalFile(req.user.avatar).catch(() => {}))
    }
    if (identitasUrl && req.user.identitas_photo) {
      deletions.push(deleteLocalFile(req.user.identitas_photo).catch(() => {}))
    }
    await Promise.all(deletions)

    success(res, user, "Profil berhasil diperbarui")
  } catch (err) {
    await Promise.all(
      [avatarUrl, identitasUrl]
        .filter(Boolean)
        .map((url) => deleteLocalFile(url).catch(() => {})),
    )
    throw err
  }
})

exports.applyTipe = asyncHandler(async (req, res) => {
  let identitasUrl

  try {
    if (req.files && req.files.identitas_photo && req.files.identitas_photo[0]) {
      const result = await saveLocalFile(req.files.identitas_photo[0], "identitas")
      identitasUrl = result.url
    }

    const user = await authService.applyTipe(
      req.user.id,
      req.body.tipe,
      req.body.nim_nip,
      identitasUrl,
    )

    // Hapus file identitas lama HANYA setelah service sukses (validasi lulus).
    if (identitasUrl && req.user.identitas_photo) {
      await deleteLocalFile(req.user.identitas_photo).catch(() => {})
    }

    success(res, user, "Pengajuan verifikasi tipe berhasil dikirim ke admin")
  } catch (err) {
    if (identitasUrl) {
      await deleteLocalFile(identitasUrl).catch(() => {})
    }
    throw err
  }
})

exports.deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user.id, req.body.password)
  success(res, null, "Akun berhasil dihapus")
})
