const settingService = require("../services/settingService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const { logActivity } = require("../services/activityLogService")

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.getSettings()

  success(res, settings)
})

exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingService.updateSettings(req.body)

  await logActivity({
    userId: req.user.id,
    action: "settings_updated",
    description: `${req.user.name} memperbarui pengaturan sistem`,
  })

  success(res, settings, "Pengaturan berhasil disimpan")
})
