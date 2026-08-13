const hallService = require("../services/hallService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getHallOverview = asyncHandler(async (req, res) => {
  const data = await hallService.getHallOverview()

  success(res, data)
})
