const dashboardService = require("../services/dashboardService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await dashboardService.getDashboard()

  success(res, dashboard)
})
