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

  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi harus berupa teks"),

  body("icon")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Icon hanya boleh huruf, angka, dash, dan underscore"),

  body("color")
    .optional()
    .trim()
    .matches(/^#?[0-9a-fA-F]{3,8}$/)
    .withMessage("Warna harus berupa hex yang valid (contoh: #38bdf8)"),

  body("sort_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Urutan harus berupa angka positif"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active harus boolean"),
]

exports.updateCategoryValidator = [
  body("name").optional().trim().notEmpty().withMessage("Nama kategori tidak boleh kosong"),

  body("slug")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Slug hanya boleh huruf, angka, dash, dan underscore"),

  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi harus berupa teks"),

  body("icon")
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Icon hanya boleh huruf, angka, dash, dan underscore"),

  body("color")
    .optional()
    .trim()
    .matches(/^#?[0-9a-fA-F]{3,8}$/)
    .withMessage("Warna harus berupa hex yang valid (contoh: #38bdf8)"),

  body("sort_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Urutan harus berupa angka positif"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active harus boolean"),
]
