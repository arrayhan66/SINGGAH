const router = require("express").Router()

const publicStatsController = require("../controllers/publicStatsController")
const { visitLimiter } = require("../middlewares/rateLimiter")

router.get("/", publicStatsController.getPublicStats)
router.post("/visit", visitLimiter, publicStatsController.addVisit)

module.exports = router
