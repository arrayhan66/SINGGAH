const router = require("express").Router()
const ctrl = require("../controllers/projectLikeController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/likes", ctrl.getLikes)
router.post("/:id/like", authMiddleware, ctrl.toggleLike)

module.exports = router
