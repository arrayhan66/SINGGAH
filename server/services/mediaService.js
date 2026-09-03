const fs = require("fs")
const path = require("path")
const AppError = require("../utils/AppError")
const {
  saveLocalFile,
  deleteLocalFile,
  listLocalFiles,
  UPLOAD_ROOT,
} = require("../utils/localImage")

const MEDIA_FOLDER = "media"

function extToType(ext) {
  if (["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)) {
    return "image"
  }
  if (["mp4", "webm", "ogv", "mov", "avi"].includes(ext)) {
    return "video"
  }
  return "raw"
}

function formatResource(name, folder) {
  const dot = name.lastIndexOf(".")
  const base = dot > 0 ? name.slice(0, dot) : name
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : ""
  const relPath = folder ? `${folder}/${name}` : name
  const absPath = path.join(UPLOAD_ROOT, folder || "", name)
  let size = 0
  let uploadedAt = new Date().toISOString()
  try {
    const st = fs.statSync(absPath)
    size = st.size
    uploadedAt = st.mtime.toISOString()
  } catch {
    // ignore
  }

  return {
    publicId: relPath.replace(/\.[^/.]+$/, ""),
    url: `/uploads/${relPath}`,
    name,
    format: ext,
    type: extToType(ext),
    size,
    uploadedAt,
    width: null,
    height: null,
  }
}

exports.getMedia = async (query = {}) => {
  const names = listLocalFiles(MEDIA_FOLDER)
  return names.map((name) => formatResource(name, MEDIA_FOLDER))
}

exports.uploadMedia = async (file) => {
  if (!file) {
    throw new AppError("File wajib diupload", 400)
  }

  const result = await saveLocalFile(file, MEDIA_FOLDER, {
    resource_type: "auto",
    filename: file.originalname,
  })

  const rel = result.url.split("/uploads/")[1]
  const baseName = rel.split("/").pop()
  return formatResource(baseName, MEDIA_FOLDER)
}

exports.deleteMedia = async (publicId) => {
  if (!publicId) {
    throw new AppError("public_id wajib diisi", 400)
  }

  let rel = String(publicId).replace(/^\/uploads\//, "").replace(/^\//, "")

  // publicId dari list berbentuk "media/<base>" tanpa ekstensi.
  // Cari file asli dengan ekstensi bila publicId tanpa ekstensi.
  let absPath = path.join(UPLOAD_ROOT, rel.replace(/\.\./g, ""))
  if (!fs.existsSync(absPath)) {
    if (rel.startsWith(MEDIA_FOLDER + "/")) {
      const base = rel.slice(MEDIA_FOLDER.length + 1)
      const match = listLocalFiles(MEDIA_FOLDER).find((n) =>
        n.startsWith(base),
      )
      if (match) {
        absPath = path.join(UPLOAD_ROOT, MEDIA_FOLDER, match)
      }
    }
  }

  if (!fs.existsSync(absPath)) {
    throw new AppError("Media tidak ditemukan", 404)
  }

  fs.unlinkSync(absPath)
  return true
}
