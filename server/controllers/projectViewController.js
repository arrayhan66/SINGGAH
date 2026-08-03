const asyncHandler = require("../utils/asyncHandler")
const projectViewService = require("../services/projectViewService")
const { success } = require("../utils/response")

exports.addView = asyncHandler(async (req, res) => {
  const ip = req.ip || req.connection?.remoteAddress || null
  await projectViewService.addView(req.params.id, req.user || null, ip)
  const count = await projectViewService.getViewCount(req.params.id)
  success(res, { viewsCount: count })
})
