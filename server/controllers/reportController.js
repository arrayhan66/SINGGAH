const reportService = require("../services/reportService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getReports = asyncHandler(async (req, res) => {
  const reports = await reportService.getReports(req.query)

  success(res, reports)
})
