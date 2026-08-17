const router = require("express").Router()

const mediaController = require("../controllers/mediaController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")
const { dynamicUpload } = require("../middlewares/uploadMiddleware")

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  mediaController.getMedia,
)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  dynamicUpload,
  mediaController.uploadMedia,
)

router.delete(
  "/{*publicId}",
  authMiddleware,
  roleMiddleware("admin"),
  mediaController.deleteMedia,
)

module.exports = router
