const router = require("express").Router()
const ctrl = require("../controllers/projectVideoController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/videos", ctrl.getVideos)
router.post("/:id/videos", authMiddleware, ctrl.addVideo)
router.delete(
  "/:id/videos/:videoId",
  authMiddleware,
  ctrl.removeVideo,
)

module.exports = router
