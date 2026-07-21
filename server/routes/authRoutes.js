const router = require("express").Router()

const authController = require("../controllers/authController")
const authMiddleware = require("../middlewares/authMiddleware")
const validate = require("../middlewares/validateMiddleware")
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resendCodeLimiter,
} = require("../middlewares/rateLimiter")
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyCodeValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("../validators/authValidator")

router.post(
  "/register",
  registerLimiter,
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
  "/verify-email",
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
router.put(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  authController.changePassword,
)

module.exports = router
