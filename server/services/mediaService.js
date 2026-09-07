const AppError = require("../utils/AppError")
const {
  listCloudinaryMedia,
  uploadImage,
  deleteImage,
} = require("../utils/uploadToCloudinary")

const CLOUD_FOLDER = "singgah/media"

function formatCloudResource(r) {
  return {
    publicId: r.public_id,
    url: r.secure_url,
    name: r.filename || r.public_id.split("/").pop(),
    format: r.format,
    type: r.resource_type,
    size: r.bytes,
    uploadedAt: r.created_at,
    width: r.width || null,
    height: r.height || null,
  }
}

exports.getMedia = async (query = {}) => {
  const resources = await listCloudinaryMedia(query)
  return resources.map(formatCloudResource)
}

exports.uploadMedia = async (file) => {
  if (!file) {
    throw new AppError("File wajib diupload", 400)
  }

  const result = await uploadImage(file.buffer, CLOUD_FOLDER, {
    resource_type: "auto",
    filename: file.originalname,
    use_filename: true,
  })

  return formatCloudResource(result)
}

exports.deleteMedia = async (publicId) => {
  if (!publicId) {
    throw new AppError("public_id wajib diisi", 400)
  }

  const result = await deleteImage(publicId)

  if (result && result.result === "not found") {
    throw new AppError("Media tidak ditemukan", 404)
  }

  return true
}