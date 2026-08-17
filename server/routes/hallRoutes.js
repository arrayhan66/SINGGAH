const router = require("express").Router()

const hallController = require("../controllers/hallController")
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware")

router.get("/", optionalAuthMiddleware, hallController.getHallOverview)

module.exports = router
