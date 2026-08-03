const publicStatsService = require("../services/publicStatsService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getPublicStats = asyncHandler(async (req, res) => {
  const stats = await publicStatsService.getPublicStats()

  success(res, stats)
})
