const {
  saveLocalFile,
  deleteLocalFile,
} = require("./localImage")

// Wrapper Cloudinary-compatible yang menyimpan file ke disk lokal.
// Menjaga bentuk return (secure_url, public_id, format, ...) agar
// seluruh controller/service yang lama tidak perlu diubah.

exports.uploadImage = async (fileOrBuffer, folder = "uploads", options = {}) => {
  const result = await saveLocalFile(fileOrBuffer, folder, options)
  return {
    secure_url: result.url,
    public_id: result.public_id,
    format: result.format,
    bytes: result.bytes,
    created_at: result.created_at,
    resource_type: result.resource_type,
    width: result.width,
    height: result.height,
    filename: (options && options.filename) || null,
  }
}

exports.deleteImage = (value) => deleteLocalFile(value)

exports.getPublicIdFromUrl = (url) => {
  if (!url) return null
  // Hanya tangani file lokal. URL cloudinary lama tidak di-delete
  // (tidak bisa diakses dari server ini).
  if (!String(url).includes("/uploads/")) return null
  const rel = String(url).split("/uploads/")[1]
  if (!rel) return null
  return rel.replace(/\.[^/.]+$/, "")
}
