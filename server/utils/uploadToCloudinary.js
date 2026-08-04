const cloudinary = require("../config/cloudinary")

exports.uploadImage = (fileBuffer, folder) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({
      secure_url: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      public_id: "test/test",
    })
  }
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
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({ result: "ok" })
  }
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
