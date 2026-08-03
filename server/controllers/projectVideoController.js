const asyncHandler = require("../utils/asyncHandler")
const projectVideoService = require("../services/projectVideoService")
const { success } = require("../utils/response")

exports.getVideos = asyncHandler(async (req, res) => {
  const videos = await projectVideoService.getVideos(req.params.id)
  success(res, videos)
})

exports.addVideo = asyncHandler(async (req, res) => {
  const video = await projectVideoService.addVideo(
    req.params.id,
    req.body,
    req.user,
  )
  success(res, video, "Video ditambahkan", 201)
})

exports.removeVideo = asyncHandler(async (req, res) => {
  await projectVideoService.removeVideo(
    req.params.id,
    req.params.videoId,
    req.user,
  )
  success(res, null, "Video dihapus")
})
