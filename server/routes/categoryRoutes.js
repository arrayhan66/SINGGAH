const router = require("express").Router()

const categoryController = require("../controllers/categoryController")

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

router.get("/", categoryController.getCategories)

router.get("/:id", categoryController.getCategoryById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.createCategory,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.updateCategory,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.deleteCategory,
)

module.exports = router
