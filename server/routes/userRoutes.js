const router = require("express").Router()

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validateMiddleware")

const userController = require("../controllers/userController")
const {
  createUserValidator,
  updateUserValidator,
  approveTipeValidator,
} = require("../validators/userValidator")

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
  createUserValidator,
  validate,
  userController.createUser,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUserValidator,
  validate,
  userController.updateUser,
)

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.deleteUser,
)

router.post(
  "/:id/approve-tipe",
  authMiddleware,
  roleMiddleware("admin"),
  approveTipeValidator,
  validate,
  userController.approveTipe,
)

module.exports = router
