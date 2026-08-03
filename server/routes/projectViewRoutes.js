const router = require("express").Router()
const ctrl = require("../controllers/projectViewController")

router.post("/:id/view", ctrl.addView)

module.exports = router
