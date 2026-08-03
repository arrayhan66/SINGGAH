const { body } = require("express-validator")

exports.createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama kategori wajib diisi"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug wajib diisi")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Slug hanya boleh huruf, angka, dash, dan underscore"),
]

exports.updateCategoryValidator = [
  body("name").optional().trim().notEmpty().withMessage("Nama kategori tidak boleh kosong"),

  body("slug")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Slug hanya boleh huruf, angka, dash, dan underscore"),
]
