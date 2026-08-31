const projectImageService = require("../services/projectImageService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const AppError = require("../utils/AppError")

exports.getImages = asyncHandler(async (req, res) => {
  const images = await projectImageService.getImages(req.params.id)
  success(res, images)
})

exports.addImage = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.image || req.files.image.length === 0) {
    throw new AppError("Gambar wajib diupload", 400)
  }

  const result = await uploadImage(
    req.files.image[0].buffer,
    "singgah/projects",
  )

  try {
    const image = await projectImageService.addImage(
      req.params.id,
      result.secure_url,
      req.user,
    )
    success(res, image, "Gambar berhasil ditambahkan", 201)
  } catch (err) {
    const publicId = getPublicIdFromUrl(result.secure_url)
    if (publicId) await deleteImage(publicId).catch(() => {})
    throw err
  }
})

exports.removeImage = asyncHandler(async (req, res) => {
  const image = await projectImageService.removeImage(
    req.params.id,
    req.params.imageId,
    req.user,
  )

  const publicId = getPublicIdFromUrl(image.image_url)
  if (publicId) {
    await deleteImage(publicId)
  }

  success(res, null, "Gambar berhasil dihapus")
})
