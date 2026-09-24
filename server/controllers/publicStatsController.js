const publicStatsService = require("../services/publicStatsService")
const siteVisitService = require("../services/siteVisitService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getPublicStats = asyncHandler(async (req, res) => {
  const stats = await publicStatsService.getPublicStats()

  success(res, stats)
})

exports.addVisit = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || null
  await siteVisitService.recordVisit(ip)

  success(res, { recorded: true })
})
