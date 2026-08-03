const router = require("express").Router()
const ctrl = require("../controllers/projectLinkController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/links", ctrl.getLinks)
router.post("/:id/links", authMiddleware, ctrl.addLink)
router.delete("/:id/links/:linkId", authMiddleware, ctrl.removeLink)

module.exports = router
