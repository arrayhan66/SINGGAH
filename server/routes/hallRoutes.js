const router = require("express").Router()

const hallController = require("../controllers/hallController")

router.get("/", hallController.getHallOverview)

module.exports = router
