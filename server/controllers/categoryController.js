const categoryService = require("../services/categoryService")

const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const { logActivity } = require("../services/activityLogService")

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

  await logActivity({
    userId: req.user.id,
    action: "category_created",
    targetType: "category",
    targetId: category.id,
    description: `${req.user.name} membuat kategori "${category.name}"`,
  })

  success(res, category, "Kategori berhasil dibuat", 201)
})

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body)

  await logActivity({
    userId: req.user.id,
    action: "category_updated",
    targetType: "category",
    targetId: category.id,
    description: `${req.user.name} memperbarui kategori "${category.name}"`,
  })

  success(res, category, "Kategori berhasil diperbarui")
})

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id)

  await categoryService.deleteCategory(req.params.id)

  await logActivity({
    userId: req.user.id,
    action: "category_deleted",
    targetType: "category",
    targetId: category.id,
    description: `${req.user.name} menghapus kategori "${category.name}"`,
  })

  success(res, null, "Kategori berhasil dihapus")
})
