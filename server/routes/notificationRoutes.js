const express = require("express")
const router = express.Router()
const notificationController = require("../controllers/notificationController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get("/", authMiddleware, notificationController.getMyNotifications)
router.patch("/read-all", authMiddleware, notificationController.markAllAsRead)
router.post("/bulk", authMiddleware, notificationController.bulkUpdate)
router.delete("/all", authMiddleware, notificationController.deleteAllNotifications)
router.delete("/bulk", authMiddleware, notificationController.bulkDelete)
router.post(
  "/announcements",
  authMiddleware,
  roleMiddleware("admin"),
  notificationController.sendAnnouncement,
)
router.patch("/:id/read", authMiddleware, notificationController.markAsRead)
router.patch("/:id/unread", authMiddleware, notificationController.markAsUnread)
router.delete("/:id", authMiddleware, notificationController.deleteNotification)

module.exports = router