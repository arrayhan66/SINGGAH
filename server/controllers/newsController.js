const newsService = require("../services/newsService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const AppError = require("../utils/AppError")

exports.getNews = asyncHandler(async (req, res) => {
  const news = await newsService.getNews(req.query)

  success(res, news)
})

exports.getNewsById = asyncHandler(async (req, res) => {
  const news = await newsService.getNewsById(req.params.id)

  success(res, news)
})

exports.createNews = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.headline_image) {
    throw new AppError("Headline image wajib diupload", 400)
  }

  const headlineResult = await uploadImage(
    req.files.headline_image[0].buffer,
    "pamerit/news",
  )

  req.body.headline_image = headlineResult.secure_url

  const news = await newsService.createNews(req.body, req.user.id)

  success(res, news, "News berhasil dibuat", 201)
})

exports.updateNews = asyncHandler(async (req, res) => {
  const existingNews = await newsService.getNewsById(req.params.id)

  if (req.files && req.files.headline_image) {
    const oldPublicId = getPublicIdFromUrl(existingNews.headline_image)

    if (oldPublicId) {
      await deleteImage(oldPublicId)
    }

    const result = await uploadImage(
      req.files.headline_image[0].buffer,
      "pamerit/news",
    )

    req.body.headline_image = result.secure_url
  }

  const news = await newsService.updateNews(req.params.id, req.body)

  success(res, news, "News berhasil diperbarui")
})

exports.deleteNews = asyncHandler(async (req, res) => {
  const news = await newsService.deleteNews(req.params.id)

  const headlinePublicId = getPublicIdFromUrl(news.headline_image)

  if (headlinePublicId) {
    await deleteImage(headlinePublicId)
  }

  success(res, null, "News berhasil dihapus")
})
