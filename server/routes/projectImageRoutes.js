const router = require("express").Router({ mergeParams: true })
const projectImageController = require("../controllers/projectImageController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")

router.get("/", projectImageController.getImages)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "user"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  projectImageController.addImage,
)

router.delete(
  "/:imageId",
  authMiddleware,
  roleMiddleware("admin", "user"),
  projectImageController.removeImage,
)

module.exports = router
