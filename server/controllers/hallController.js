const hallService = require("../services/hallService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getHallOverview = asyncHandler(async (req, res) => {
  const data = await hallService.getHallOverview(req.user?.id || null)

  success(res, data)
})
