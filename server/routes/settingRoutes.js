const router = require("express").Router()

const settingController = require("../controllers/settingController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get("/", settingController.getSettings)

router.put(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  settingController.updateSettings,
)

module.exports = router
