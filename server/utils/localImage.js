const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "..", "uploads")

const MIME_EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/x-rar-compressed": ".rar",
  "application/vnd.rar": ".rar",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogv",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
}

function sniffExt(buffer) {
  if (!buffer || buffer.length < 4) return null
  const b = buffer
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47
  )
    return ".png"
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ".jpg"
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46)
    return ".webp"
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return ".gif"
  if (
    b[0] === 0x25 &&
    b[1] === 0x50 &&
    b[2] === 0x44 &&
    b[3] === 0x46
  )
    return ".pdf"
  if (
    (b[0] === 0x50 && b[1] === 0x4b) ||
    (b[0] === 0x50 && b[1] === 0x4b) ||
    (b[0] === 0x1f && b[1] === 0x8b) ||
    (b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72)
  )
    return ".zip"
  return null
}

function resolveExt(fileOrBuffer, options) {
  const mime = String(
    (fileOrBuffer && fileOrBuffer.mimetype) ||
      (options && options.mimetype) ||
      "",
  ).toLowerCase()
  if (MIME_EXT[mime]) return MIME_EXT[mime]

  const sniffed = sniffExt(
    fileOrBuffer && fileOrBuffer.buffer
      ? fileOrBuffer.buffer
      : fileOrBuffer,
  )
  if (sniffed) return sniffed

  const original = String(
    (options && (options.filename || options.original_filename)) ||
      (fileOrBuffer && fileOrBuffer.originalname) ||
      "",
  )
  const dot = original.lastIndexOf(".")
  if (dot >= 0 && dot < original.length - 1) {
    const ext = original.slice(dot).toLowerCase()
    if (/^\.[a-z0-9]{1,8}$/.test(ext)) return ext
  }
  return ""
}

function ensureDir(dir) {
  if (fs.existsSync(dir)) return
  fs.mkdirSync(dir, { recursive: true })
}

function buildName(folder, fileOrBuffer, options) {
  const safeFolder = String(folder).replace(/[^a-z0-9-_/]/gi, "")
  const ext = resolveExt(fileOrBuffer, options)
  const stamp = Date.now()
  const rand = crypto.randomBytes(6).toString("hex")
  const name = `${stamp}-${rand}${ext}`
  const relPath = safeFolder ? `${safeFolder}/${name}` : name
  return { relPath, name, ext }
}

function writeBuffer(fileOrBuffer, relPath) {
  const safeRel = relPath.replace(/\.\./g, "")
  const absPath = path.join(UPLOAD_ROOT, safeRel)
  ensureDir(path.dirname(absPath))
  const buffer = fileOrBuffer && fileOrBuffer.buffer ? fileOrBuffer.buffer : fileOrBuffer
  fs.writeFileSync(absPath, Buffer.from(buffer))
  return absPath
}

function toUrl(relPath) {
  return `/uploads/${relPath}`
}

function isUrlLike(value) {
  return String(value).includes("/uploads/")
}

exports.saveLocalFile = (fileOrBuffer, folder, options = {}) => {
  if (process.env.NODE_ENV === "test") {
    const ext = resolveExt(fileOrBuffer, options)
    return Promise.resolve({
      url: `https://test.local/uploads/${folder}/test${ext || ".jpg"}`,
      public_id: `${folder}/test`,
      format: (ext || ".jpg").replace(".", ""),
      bytes: fileOrBuffer && fileOrBuffer.buffer ? fileOrBuffer.buffer.length : 0,
      created_at: new Date().toISOString(),
      resource_type: options.resource_type || "image",
      width: null,
      height: null,
    })
  }

  const { relPath, ext } = buildName(folder, fileOrBuffer, options)
  writeBuffer(fileOrBuffer, relPath)
  const publicId = ext ? relPath.replace(ext, "") : relPath
  return Promise.resolve({
    url: toUrl(relPath),
    public_id: publicId,
    format: (ext || "").replace(".", ""),
    bytes: fileOrBuffer && fileOrBuffer.buffer ? fileOrBuffer.buffer.length : 0,
    created_at: new Date().toISOString(),
    resource_type: options.resource_type || "image",
    width: null,
    height: null,
  })
}

exports.deleteLocalFile = (urlOrPath) => {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({ result: "ok" })
  }
  if (!urlOrPath) return Promise.resolve({ result: "ok" })

  let rel
  if (isUrlLike(urlOrPath)) {
    rel = String(urlOrPath).split("/uploads/")[1]
  } else {
    rel = String(urlOrPath).replace(/^[/\\]+/, "")
  }
  if (!rel) return Promise.resolve({ result: "ok" })

  const safeRel = rel.replace(/\.\./g, "")
  const absPath = path.join(UPLOAD_ROOT, safeRel)
  try {
    fs.unlinkSync(absPath)
  } catch {
    // file sudah tidak ada -> anggap berhasil
  }
  return Promise.resolve({ result: "ok" })
}

exports.getLocalPathFromUrl = (url) => {
  if (!url) return null
  if (isUrlLike(url)) return String(url).split("/uploads/")[1] || null
  return null
}

exports.listLocalFiles = (folder) => {
  const safeFolder = String(folder).replace(/[^a-z0-9-_/]/gi, "")
  const dir = path.join(UPLOAD_ROOT, safeFolder)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .sort()
    .reverse()
}

exports.UPLOAD_ROOT = UPLOAD_ROOT
