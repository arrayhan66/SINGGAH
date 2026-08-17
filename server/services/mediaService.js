const cloudinary = require("../config/cloudinary")
const { uploadImage } = require("../utils/uploadToCloudinary")
const AppError = require("../utils/AppError")

const formatResource = (r) => ({
  publicId: r.public_id,
  url: r.secure_url,
  name: r.filename || r.public_id.split("/").pop(),
  format: r.format,
  type: r.resource_type,
  size: r.bytes,
  uploadedAt: r.created_at,
  width: r.width || null,
  height: r.height || null,
})

exports.getMedia = async (query = {}) => {
  const maxResults = Math.min(parseInt(query.limit) || 100, 200)

  const result = await cloudinary.search
    .expression("folder:singgah/media")
    .sort_by("created_at", "desc")
    .max_results(maxResults)
    .execute()

  return result.resources.map(formatResource)
}

exports.uploadMedia = async (file) => {
  if (!file) {
    throw new AppError("File wajib diupload", 400)
  }

  const result = await uploadImage(file.buffer, "singgah/media", {
    resource_type: "auto",
    filename: file.originalname,
    use_filename: true,
  })

  return formatResource(result)
}

exports.deleteMedia = async (publicId) => {
  if (!publicId) {
    throw new AppError("public_id wajib diisi", 400)
  }

  const result = await cloudinary.uploader.destroy(publicId)

  if (result.result === "not found") {
    throw new AppError("Media tidak ditemukan", 404)
  }

  return true
}
