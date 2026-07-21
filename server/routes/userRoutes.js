const router = require("express").Router()

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

const userController = require("../controllers/userController")

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  userController.getUsers,
)

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.getUserById,
)

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  userController.createUser,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.updateUser,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.deleteUser,
)

module.exports = router
