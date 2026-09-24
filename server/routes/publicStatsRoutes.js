const router = require("express").Router()

const publicStatsController = require("../controllers/publicStatsController")

router.get("/", publicStatsController.getPublicStats)
router.post("/visit", publicStatsController.addVisit)

module.exports = router
