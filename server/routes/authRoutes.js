const router = require("express").Router()

const authController = require("../controllers/authController")
const authMiddleware = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validateMiddleware")
const upload = require("../middlewares/uploadMiddleware")
const { dynamicUploadFields } = require("../middlewares/uploadMiddleware")
const {
  loginLimiter,
  registerLimiter,
  googleLimiter,
  forgotPasswordLimiter,
  resendCodeLimiter,
  verifyCodeLimiter,
  checkEmailLimiter,
} = require("../middlewares/rateLimiter")
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyCodeValidator,
  resetPasswordValidator,
  changePasswordValidator,
  applyTipeValidator,
  updateProfileValidator,
  deleteAccountValidator,
} = require("../validators/authValidator")

router.post(
  "/register",
  registerLimiter,
  dynamicUploadFields([
    { name: "avatar", maxCount: 1 },
    { name: "identitas_photo", maxCount: 1 },
  ]),
  registerValidator,
  validate,
  authController.register,
)
router.post(
  "/login",
  loginLimiter,
  loginValidator,
  validate,
  authController.login,
)
router.post(
  "/google",
  googleLimiter,
  authController.googleLogin,
)
router.post(
  "/check-email",
  checkEmailLimiter,
  forgotPasswordValidator,
  validate,
  authController.checkEmail,
)
router.post(
  "/verify-email",
  verifyCodeLimiter,
  verifyCodeValidator,
  validate,
  authController.verifyEmail,
)
router.post(
  "/resend-verification",
  resendCodeLimiter,
  forgotPasswordValidator,
  validate,
  authController.resendVerification,
)
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword,
)
router.post(
  "/verify-reset-code",
  verifyCodeLimiter,
  verifyCodeValidator,
  validate,
  authController.verifyResetCode,
)
router.post(
  "/reset-password",
  resetPasswordValidator,
  validate,
  authController.resetPassword,
)

router.get("/me", authMiddleware, authController.me)
router.get("/profile-stats", authMiddleware, authController.getProfileStats)
router.put(
  "/profile",
  authMiddleware,
  dynamicUploadFields([
    { name: "avatar", maxCount: 1 },
    { name: "identitas_photo", maxCount: 1 },
  ]),
  updateProfileValidator,
  validate,
  authController.updateProfile,
)
router.post(
  "/apply-tipe",
  authMiddleware,
  dynamicUploadFields([{ name: "identitas_photo", maxCount: 1 }]),
  applyTipeValidator,
  validate,
  authController.applyTipe,
)
router.delete(
  "/account",
  authMiddleware,
  deleteAccountValidator,
  validate,
  authController.deleteAccount,
)
router.put(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  authController.changePassword,
)

module.exports = router
