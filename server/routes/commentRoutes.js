const router = require("express").Router()
const ctrl = require("../controllers/commentController")
const authMiddleware = require("../middlewares/authMiddleware")

router.get("/:id/comments", ctrl.getComments)
router.post("/:id/comments", authMiddleware, ctrl.addComment)

router.get("/:id/comments/:commentId/replies", ctrl.getReplies)
router.post(
  "/:id/comments/:commentId/replies",
  authMiddleware,
  ctrl.addReply,
)
router.delete(
  "/:id/comments/:commentId/replies/:replyId",
  authMiddleware,
  ctrl.removeReply,
)

router.delete(
  "/:id/comments/:commentId",
  authMiddleware,
  ctrl.removeComment,
)

module.exports = router
