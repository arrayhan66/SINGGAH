const multer = require("multer")
const AppError = require("../utils/AppError")

const storage = multer.memoryStorage()

const MAX_FILE_SIZE = 5 * 1024 * 1024

const DOCUMENT_MIMETYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
]

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "documents") {
    if (file.mimetype && DOCUMENT_MIMETYPES.includes(file.mimetype)) {
      return cb(null, true)
    }

    return cb(new AppError("File dokumen tidak didukung", 400))
  }

  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return cb(null, true)
  }

  cb(new AppError("File harus berupa gambar", 400))
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
})

module.exports = upload
