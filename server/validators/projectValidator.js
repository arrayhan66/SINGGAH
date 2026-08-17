const { body } = require("express-validator")

exports.createProjectValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul wajib diisi"),

  body("slug")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Slug hanya boleh huruf, angka, dash, dan underscore"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Deskripsi wajib diisi"),

  body("year")
    .notEmpty()
    .withMessage("Tahun wajib diisi")
    .isInt({ min: 1900, max: 2100 })
    .withMessage("Tahun tidak valid"),

  body("category_id")
    .notEmpty()
    .withMessage("Kategori wajib diisi")
    .isInt()
    .withMessage("Kategori tidak valid"),
]

exports.updateProjectValidator = [
  body("title").optional().trim().notEmpty().withMessage("Judul tidak boleh kosong"),

  body("slug")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Slug hanya boleh huruf, angka, dash, dan underscore"),

  body("description").optional().trim().notEmpty().withMessage("Deskripsi tidak boleh kosong"),

  body("year").optional().isInt({ min: 1900, max: 2100 }).withMessage("Tahun tidak valid"),

  body("category_id").optional().isInt().withMessage("Kategori tidak valid"),

  body("status")
    .optional()
    .isIn(["pending", "published", "rejected"])
    .withMessage("Status tidak valid"),
]

exports.updateProjectStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status wajib diisi")
    .isIn(["pending", "published", "rejected"])
    .withMessage("Status harus pending, published, atau rejected"),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Alasan maksimal 500 karakter"),
]
