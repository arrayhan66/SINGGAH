const router = require("express").Router()

const dashboardController = require("../controllers/dashboardController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  dashboardController.getDashboard,
)

module.exports = router
