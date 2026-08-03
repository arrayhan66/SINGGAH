const router = require("express").Router()
const ctrl = require("../controllers/bookmarkController")
const authMiddleware = require("../middlewares/authMiddleware")

router.post("/:id/bookmark", authMiddleware, ctrl.toggleBookmark)
router.get("/my-bookmarks", authMiddleware, ctrl.getMyBookmarks)

module.exports = router
