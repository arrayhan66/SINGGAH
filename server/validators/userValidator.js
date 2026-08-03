const { body } = require("express-validator")

exports.createUserValidator = [
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
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
]

exports.updateUserValidator = [
  body("name").optional().trim().notEmpty().withMessage("Nama tidak boleh kosong"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username hanya boleh huruf, angka, dan underscore"),

  body("email").optional().trim().isEmail().withMessage("Format email tidak valid").normalizeEmail(),

  body("password").optional().isLength({ min: 8 }).withMessage("Password minimal 8 karakter"),

  body("role").optional().isIn(["admin", "user"]).withMessage("Role tidak valid"),

  body("tipe")
    .optional()
    .isIn(["admin", "mahasiswa", "dosen", "umum"])
    .withMessage("Tipe tidak valid"),

  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status tidak valid"),
]
