const cloudinary = require("../config/cloudinary")

exports.uploadImage = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error)

          resolve(result)
        },
      )
      .end(fileBuffer)
  })
}

exports.deleteImage = (publicId) => {
  return cloudinary.uploader.destroy(publicId)
}

exports.getPublicIdFromUrl = (url) => {
  if (!url) return null

  const parts = url.split("/upload/")

  if (parts.length < 2) return null

  const pathWithVersion = parts[1]
  const withoutVersion = pathWithVersion.replace(/^v\d+\//, "")
  const withoutExtension = withoutVersion.replace(/\.[^/.]+$/, "")

  return withoutExtension
}
