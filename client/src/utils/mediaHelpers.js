import { FileImage, FileText, FileArchive, File } from "lucide-react"

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = bytes / Math.pow(k, i)
  return `${val % 1 === 0 ? val : val.toFixed(1)} ${sizes[i]}`
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getFileIcon(mime) {
  if (!mime) return File
  if (mime.startsWith("image/")) return FileImage
  if (mime.includes("zip") || mime.includes("rar"))
    return FileArchive
  if (
    mime.includes("pdf") ||
    mime.includes("document") ||
    mime.includes("sheet")
  )
    return FileText
  return File
}

export function getFileTypeLabel(mime) {
  if (!mime) return "UNKNOWN"
  if (mime.includes("pdf")) return "PDF"
  if (mime.includes("wordprocessingml")) return "DOCX"
  if (mime.includes("spreadsheetml")) return "XLSX"
  if (mime.includes("presentationml")) return "PPTX"
  if (mime.includes("msword") || mime.includes("word")) return "DOC"
  if (mime.includes("ms-excel") || mime.includes("excel")) return "XLS"
  if (mime.includes("ms-powerpoint") || mime.includes("powerpoint")) return "PPT"
  if (mime.includes("zip") || mime.includes("rar")) return "ARCHIVE"
  if (mime.startsWith("image/")) return mime.split("/").pop().toUpperCase()
  return mime.split("/").pop().toUpperCase()
}

const IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "avif",
  "bmp",
  "tiff",
  "tif",
  "heic",
  "heif",
]

const DOC_MIME_MAP = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
}

const PREVIEWABLE_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
]

export function isPreviewable(mime) {
  return PREVIEWABLE_IMAGE_TYPES.includes(mime)
}

export function isPdf(mime) {
  return mime === "application/pdf"
}

export function getFileCategory(mime) {
  if (!mime) return "document"
  if (mime.startsWith("image/")) return "image"
  return "document"
}

export function getFileThumbStyle(mime) {
  const base = {
    label: "FILE",
    bg: "from-slate-500 to-slate-700",
    accent: "from-cyan-400 to-blue-500",
    chipClass: "media-chip-file",
  }
  if (!mime) return base
  if (mime.startsWith("image/"))
    return {
      ...base,
      label: mime.includes("svg") ? "SVG" : mime.split("/").pop().toUpperCase(),
      bg: "from-fuchsia-500/90 to-purple-700/90",
      accent: "from-fuchsia-400 to-purple-500",
      chipClass: "media-chip-video",
    }
  if (mime.includes("pdf"))
    return {
      ...base,
      label: "PDF",
      bg: "from-red-500/90 to-rose-700/90",
      accent: "from-orange-400 via-rose-500 to-red-500",
      chipClass: "media-chip-pdf",
    }
  if (mime.includes("powerpoint") || mime.includes("presentation") || mime.includes("ppt"))
    return {
      ...base,
      label: "PPT",
      bg: "from-orange-500/90 to-red-600/90",
      accent: "from-orange-400 via-rose-500 to-orange-400",
      chipClass: "media-chip-ppt",
    }
  if (mime.includes("word") || mime.includes("document"))
    return {
      ...base,
      label: "DOC",
      bg: "from-blue-500/90 to-indigo-700/90",
      accent: "from-blue-400 to-indigo-500",
      chipClass: "media-chip-doc",
    }
  if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv"))
    return {
      ...base,
      label: "XLS",
      bg: "from-green-500/90 to-emerald-700/90",
      accent: "from-emerald-400 to-teal-500",
      chipClass: "media-chip-xls",
    }
  if (mime.includes("zip") || mime.includes("rar"))
    return {
      ...base,
      label: "ZIP",
      bg: "from-amber-400/90 to-yellow-600/90",
      accent: "from-amber-300 to-yellow-500",
      chipClass: "media-chip-zip",
    }
  const ext = mime.split("/").pop()
  return {
    ...base,
    label: ext ? ext.toUpperCase().slice(0, 4) : "FILE",
  }
}

function mapImageFormat(format) {
  if (format === "jpg") return "jpeg"
  if (format === "tif") return "tiff"
  if (format === "svg") return "svg+xml"
  return format
}

function extFromItem(item) {
  const raw = [item.name, item.publicId, item.url]
    .filter(Boolean)
    .join(".")
    .toLowerCase()
  const clean = raw.split("?")[0]
  const ext = clean.split(".").pop() || ""
  return ext.length <= 5 ? ext : ""
}

export function toMimeType(item) {
  const format = (item.format ? String(item.format).toLowerCase() : "").replace(/^\./, "")

  if (item.type === "image" && IMAGE_FORMATS.includes(format)) {
    return `image/${mapImageFormat(format)}`
  }
  if (format in DOC_MIME_MAP) return DOC_MIME_MAP[format]
  if (IMAGE_FORMATS.includes(format)) return `image/${mapImageFormat(format)}`

  const ext = extFromItem(item)
  if (ext in DOC_MIME_MAP) return DOC_MIME_MAP[ext]
  if (IMAGE_FORMATS.includes(ext)) return `image/${mapImageFormat(ext)}`

  return `application/${format || ext || "octet-stream"}`
}

export function fixCloudinaryUrl(url) {
  return url
}

// PDF yang terupload sebagai image resource tidak bisa disajikan aslinya (401),
// tapi halaman pertamanya bisa diubah ke .jpg untuk tampilan public.
export function getDocumentPreviewUrl(item) {
  const url = item?.url || ""
  const mime = item?.type || ""
  if (url.includes("/image/upload/") && mime.includes("pdf")) {
    return url.replace(/\.pdf$/i, ".jpg")
  }
  return url
}

export function normalizeMedia(item) {
  const mime = toMimeType(item)
  return {
    id: item.publicId,
    publicId: item.publicId,
    name: item.name,
    url: fixCloudinaryUrl(item.url, mime),
    type: mime,
    rawBytes: item.size || 0,
    size: formatBytes(item.size || 0),
    uploadedAt: item.uploadedAt,
    usedIn: item.usedIn ?? 0,
  }
}
