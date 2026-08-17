const { body } = require("express-validator")

exports.registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama wajib diisi")
    .isLength({ min: 3 })
    .withMessage("Nama minimal 3 karakter"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username wajib diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username hanya boleh huruf, angka, dan underscore"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung minimal 1 huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung minimal 1 angka"),
]

exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password").notEmpty().withMessage("Password wajib diisi"),
]

exports.forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),
]

exports.verifyCodeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Kode wajib diisi")
    .isLength({ min: 6, max: 6 })
    .withMessage("Kode harus 6 digit")
    .isNumeric()
    .withMessage("Kode harus berupa angka"),
]

exports.resetPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("code")
    .trim()
    .notEmpty()
    .withMessage("Kode wajib diisi")
    .isLength({ min: 6, max: 6 })
    .withMessage("Kode harus 6 digit")
    .isNumeric()
    .withMessage("Kode harus berupa angka"),

  body("newPassword")
    .notEmpty()
    .withMessage("Password baru wajib diisi")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung minimal 1 huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung minimal 1 angka"),
]

exports.applyTipeValidator = [
  body("tipe")
    .trim()
    .notEmpty()
    .withMessage("Tipe wajib diisi")
    .isIn(["mahasiswa", "dosen"])
    .withMessage("Tipe harus mahasiswa atau dosen"),

  body("nim_nip")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("NIM/NIP maksimal 50 karakter"),
]

exports.changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Password lama wajib diisi"),

  body("newPassword")
    .notEmpty()
    .withMessage("Password baru wajib diisi")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .matches(/[A-Z]/)
    .withMessage("Password harus mengandung minimal 1 huruf besar")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung minimal 1 angka"),
]

exports.deleteAccountValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi untuk menghapus akun"),
]

exports.updateProfileValidator = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3 })
    .withMessage("Nama minimal 3 karakter"),

  body("username")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage("Username hanya boleh huruf, angka, titik, underscore, dan strip"),

  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Format email tidak valid")
    .normalizeEmail({ gmail_remove_dots: false }),
]
