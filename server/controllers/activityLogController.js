const activityLogService = require("../services/activityLogService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await activityLogService.getActivityLogs(req.query)

  success(res, logs)
})
