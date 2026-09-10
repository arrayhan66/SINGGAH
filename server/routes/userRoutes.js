const router = require("express").Router()

const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")
const validate = require("../middlewares/validateMiddleware")
const { dynamicUploadFields } = require("../middlewares/uploadMiddleware")

const userController = require("../controllers/userController")
const {
  createUserValidator,
  updateUserValidator,
  approveTipeValidator,
} = require("../validators/userValidator")

const userUploadFields = [
  { name: "avatar", maxCount: 1 },
  { name: "identitas_photo", maxCount: 1 },
]

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
  dynamicUploadFields(userUploadFields),
  createUserValidator,
  validate,
  userController.createUser,
)

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  dynamicUploadFields(userUploadFields),
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
