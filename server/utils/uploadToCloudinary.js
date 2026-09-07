const cloudinary = require("../config/cloudinary")

// Semua media/upload diunggah ke Cloudinary agar selalu tersedia 24/7 dari
// server mana pun (mis. Render). Tidak ada lagi penyimpanan file ke disk lokal.

exports.uploadImage = async (fileOrBuffer, folder = "uploads", options = {}) => {
  if (process.env.NODE_ENV === "test") {
    const original = String(options && options.filename)
    const parts = original.split(".")
    const format = parts.length > 1 ? parts.pop() : "jpg"
    const safeFolder = String(folder || "uploads").replace(/[\\]+/g, "/")
    return Promise.resolve({
      secure_url: `https://res.cloudinary.com/test/image/upload/v123456/${safeFolder}/test.${format}`,
      public_id: `${safeFolder}/test`,
      format,
      bytes:
        fileOrBuffer && fileOrBuffer.buffer ? fileOrBuffer.buffer.length : 0,
      created_at: new Date().toISOString(),
      resource_type: options.resource_type || "image",
      width: null,
      height: null,
    })
  }

  const buffer =
    fileOrBuffer && fileOrBuffer.buffer ? fileOrBuffer.buffer : fileOrBuffer

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          use_filename: true,
          ...options,
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        },
      )
      .end(buffer)
  })
}

exports.deleteImage = (publicId) => {
  if (process.env.NODE_ENV === "test") {
    // Stub test: kasih sinyal "not found" supaya alur 404 bisa diuji.
    const id = String(publicId || "")
    return Promise.resolve({
      result: /does-not-exist|not-found|not_found/.test(id)
        ? "not found"
        : "ok",
    })
  }
  return cloudinary.uploader.destroy(publicId)
}

exports.getPublicIdFromUrl = (url) => {
  if (!url) return null

  const parts = String(url).split("/upload/")

  if (parts.length < 2) return null

  const pathWithVersion = parts[1]
  const withoutVersion = pathWithVersion.replace(/^v\d+\//, "")
  const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "")

  return withoutExtension
}

exports.listCloudinaryMedia = async (query = {}) => {
  const maxResults = Math.min(parseInt(query.limit) || 100, 200)
  const result = await cloudinary.search
    .expression("folder:singgah/media")
    .sort_by("created_at", "desc")
    .max_results(maxResults)
    .execute()
  return result.resources
}