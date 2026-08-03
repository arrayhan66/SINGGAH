const mediaService = require("../services/mediaService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const { logActivity } = require("../services/activityLogService")

exports.getMedia = asyncHandler(async (req, res) => {
  const media = await mediaService.getMedia(req.query)

  success(res, media)
})

exports.uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files || []

  const uploaded = []

  for (const file of files) {
    const item = await mediaService.uploadMedia(file)
    uploaded.push(item)

    await logActivity({
      userId: req.user.id,
      action: "media_uploaded",
      targetType: "media",
      targetId: null,
      description: `${req.user.name} mengunggah media "${file.originalname}"`,
    })
  }

  success(res, uploaded, "Media berhasil diunggah", 201)
})

exports.deleteMedia = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.publicId)

  await logActivity({
    userId: req.user.id,
    action: "media_deleted",
    targetType: "media",
    targetId: null,
    description: `${req.user.name} menghapus media "${req.params.publicId}"`,
  })

  success(res, null, "Media berhasil dihapus")
})
