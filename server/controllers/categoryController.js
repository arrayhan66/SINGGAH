const categoryService = require("../services/categoryService")

const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories()

  success(res, categories)
})

exports.getCategoryById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id)

  success(res, category)
})

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body)

  success(res, category, "Kategori berhasil dibuat", 201)
})

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body)

  success(res, category, "Kategori berhasil diperbarui")
})

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id)

  success(res, null, "Kategori berhasil dihapus")
})
