import { FileImage, FileText, FileArchive, FileVideo, File } from "lucide-react"

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
  if (mime.startsWith("video/")) return FileVideo
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar"))
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
  if (mime.startsWith("image/")) return mime.split("/").pop().toUpperCase()
  if (mime.startsWith("video/")) return mime.split("/").pop().toUpperCase()
  if (mime.includes("pdf")) return "PDF"
  if (mime.includes("zip") || mime.includes("rar")) return "ARCHIVE"
  return mime.split("/").pop().toUpperCase()
}

export function isPreviewable(mime) {
  return mime && mime.startsWith("image/")
}

export function isPdf(mime) {
  return mime === "application/pdf"
}

export function getFileCategory(mime) {
  if (!mime) return "document"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "document"
}

export function toMimeType(item) {
  const format = item.format ? String(item.format).toLowerCase() : ""
  if (item.type === "image") return `image/${format || "png"}`
  if (item.type === "video") return `video/${format || "mp4"}`
  if (format === "pdf") return "application/pdf"
  if (format === "zip") return "application/zip"
  if (format === "rar") return "application/x-rar-compressed"
  return `application/${format || "octet-stream"}`
}

export function fixCloudinaryUrl(url, mimeType) {
  if (!url || !mimeType) return url
  if (mimeType.startsWith("image/") || mimeType.startsWith("video/")) return url
  return url.replace("/image/upload/", "/raw/upload/")
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
    usedIn: 0,
  }
}
