const router = require("express").Router()
const ctrl = require("../controllers/projectViewController")
const { viewLimiter } = require("../middlewares/rateLimiter")

router.post("/:id/view", viewLimiter, ctrl.addView)

module.exports = router
