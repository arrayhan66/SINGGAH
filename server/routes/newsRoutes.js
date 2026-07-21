const router = require("express").Router()

const newsController = require("../controllers/newsController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const upload = require("../middlewares/uploadMiddleware")

router.get("/", newsController.getNews)

router.get("/:id", newsController.getNewsById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "user"),
  upload.fields([{ name: "headline_image", maxCount: 1 }]),
  newsController.createNews,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  upload.fields([{ name: "headline_image", maxCount: 1 }]),
  newsController.updateNews,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  newsController.deleteNews,
)

module.exports = router
