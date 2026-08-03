const router = require("express").Router()

const publicStatsController = require("../controllers/publicStatsController")

router.get("/", publicStatsController.getPublicStats)

module.exports = router
