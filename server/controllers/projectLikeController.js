const asyncHandler = require("../utils/asyncHandler")
const projectLikeService = require("../services/projectLikeService")
const { success } = require("../utils/response")

exports.toggleLike = asyncHandler(async (req, res) => {
  const result = await projectLikeService.toggleLike(req.params.id, req.user)
  const count = await projectLikeService.getLikeCount(req.params.id)
  success(res, { ...result, likesCount: count })
})

exports.getLikes = asyncHandler(async (req, res) => {
  const count = await projectLikeService.getLikeCount(req.params.id)
  success(res, { likesCount: count })
})
