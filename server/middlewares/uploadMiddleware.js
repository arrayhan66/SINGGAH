const multer = require("multer")
const AppError = require("../utils/AppError")
const settingService = require("../services/settingService")

const storage = multer.memoryStorage()

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024

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

const VIDEO_MIMETYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
]

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "files") {
    const isImage = file.mimetype && file.mimetype.startsWith("image/")
    const isVideo = file.mimetype && VIDEO_MIMETYPES.includes(file.mimetype)
    const isDocument = file.mimetype && DOCUMENT_MIMETYPES.includes(file.mimetype)

    if (isImage || isVideo || isDocument) {
      return cb(null, true)
    }

    return cb(new AppError("Tipe file tidak didukung untuk media", 400))
  }

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

async function getMaxFileSize() {
  try {
    const size = await settingService.getSetting("maxUploadSize")
    return size ? Number(size) * 1024 * 1024 : DEFAULT_MAX_FILE_SIZE
  } catch {
    return DEFAULT_MAX_FILE_SIZE
  }
}

const MAX_TOTAL_BYTES = 50 * 1024 * 1024

function makeUpload(maxBytes) {
  return multer({
    storage,
    limits: {
      fileSize: maxBytes,
      fields: 50,
      files: 20,
      parts: 60,
    },
    fileFilter,
  })
}

function checkTotalSize(req, next, maxBytes) {
  const files = req.files
    ? Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat()
    : []
  const total = files.reduce((acc, f) => acc + (f.size || 0), 0)
  if (total > MAX_TOTAL_BYTES) {
    const maxMB = Math.round(MAX_TOTAL_BYTES / (1024 * 1024))
    return next(
      new AppError(
        `Total ukuran berkas melebihi batas maksimal ${maxMB} MB`,
        400,
      ),
    )
  }
  next()
}

const dynamicUpload = async (req, res, next) => {
  const maxBytes = await getMaxFileSize()
  makeUpload(maxBytes).array("files", 20)(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      const maxMB = Math.round(maxBytes / (1024 * 1024))
      return next(new AppError(`Ukuran file melebihi batas maksimal ${maxMB} MB`, 400))
    }
    if (err) return next(err)
    checkTotalSize(req, next, maxBytes)
  })
}

const dynamicUploadFields = (fields) => async (req, res, next) => {
  const maxBytes = await getMaxFileSize()
  makeUpload(maxBytes).fields(fields)(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      const maxMB = Math.round(maxBytes / (1024 * 1024))
      return next(new AppError(`Ukuran file melebihi batas maksimal ${maxMB} MB`, 400))
    }
    if (err) return next(err)
    checkTotalSize(req, next, maxBytes)
  })
}

const dynamicUploadSingle = (fieldName) => async (req, res, next) => {
  const maxBytes = await getMaxFileSize()
  makeUpload(maxBytes).single(fieldName)(req, res, (err) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      const maxMB = Math.round(maxBytes / (1024 * 1024))
      return next(new AppError(`Ukuran file melebihi batas maksimal ${maxMB} MB`, 400))
    }
    if (err) return next(err)
    checkTotalSize(req, next, maxBytes)
  })
}

module.exports = makeUpload
module.exports.dynamicUpload = dynamicUpload
module.exports.dynamicUploadFields = dynamicUploadFields
module.exports.dynamicUploadSingle = dynamicUploadSingle
module.exports.getMaxFileSize = getMaxFileSize
