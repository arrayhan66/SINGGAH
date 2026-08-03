const router = require("express").Router()

const categoryController = require("../controllers/categoryController")

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validateMiddleware")
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require("../validators/categoryValidator")

router.get("/", categoryController.getCategories)

router.get("/:id", categoryController.getCategoryById)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  createCategoryValidator,
  validate,
  categoryController.createCategory,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateCategoryValidator,
  validate,
  categoryController.updateCategory,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.deleteCategory,
)

module.exports = router
