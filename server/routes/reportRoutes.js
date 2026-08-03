const router = require("express").Router()

const reportController = require("../controllers/reportController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  reportController.getReports,
)

module.exports = router
