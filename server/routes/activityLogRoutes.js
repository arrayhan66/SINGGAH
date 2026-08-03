const router = require("express").Router()

const activityLogController = require("../controllers/activityLogController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  activityLogController.getActivityLogs,
)

module.exports = router
