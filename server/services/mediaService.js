const AppError = require("../utils/AppError")
const { News, Project, ProjectImage, User, MediaUsage } = require("../models")
const {
  listCloudinaryMedia,
  uploadImage,
  deleteImage,
} = require("../utils/uploadToCloudinary")

const CLOUD_FOLDER = "singgah/media"

function formatCloudResource(r) {
  return {
    publicId: r.public_id,
    url: r.secure_url,
    name: r.filename || r.public_id.split("/").pop(),
    format: r.format,
    type: r.resource_type,
    size: r.bytes,
    uploadedAt: r.created_at,
    width: r.width || null,
    height: r.height || null,
  }
}

// Ambil semua URL dari sebuah string (HTML, JSON editor, dsb).
function extractUrls(text) {
  const urls = new Set()
  if (!text || typeof text !== "string") return urls
  const re = /https?:\/\/[^\s"'<>\\]+/g
  let match
  while ((match = re.exec(text))) urls.add(match[0])
  return urls
}

// Kunci Cloudinary dari sebuah URL: bagian setelah "/upload/", tanpa
// query/hash dan tanpa ekstensi. Toleran terhadap transformasi CDN
// (mis. "q_auto/folder/nama.jpg" -> "q_auto/folder/nama").
function cloudinaryKey(url) {
  const clean = String(url).split("?")[0].split("#")[0]
  const i = clean.indexOf("/upload/")
  if (i === -1) return null
  return clean
    .slice(i + 8)
    .replace(/\.[a-zA-Z0-9]{1,6}$/, "")
}

const sameMedia = (mediaKey, refKey) =>
  mediaKey &&
  refKey &&
  (refKey === mediaKey || refKey.endsWith(mediaKey))

// Hitung berapa Kali setiap media dipakai (headline/galeri/konten
// berita, thumbnail & gambar proyek, avatar/identitas user).
async function countMediaUsage(mediaList) {
  const [newsList, projects, projectImages, users] = await Promise.all([
    News.findAll({ attributes: ["headline_image", "gallery", "content", "contentHTML"], raw: true }),
    Project.findAll({ attributes: ["thumbnail"], raw: true }),
    ProjectImage.findAll({ attributes: ["image_url"], raw: true }),
    User.findAll({ attributes: ["avatar", "identitas_photo"], raw: true }),
  ])

  const mediaById = new Map()
  mediaList.forEach((m) => {
    mediaById.set(m.publicId, cloudinaryKey(m.url))
  })
  const counts = new Map(mediaList.map((m) => [m.publicId, 0]))

  const rows = [
    ...newsList,
    ...projects,
    ...projectImages,
    ...users,
  ]
  for (const row of rows) {
    const refKeys = new Set()
    for (const value of Object.values(row)) {
      for (const url of extractUrls(value)) {
        const key = cloudinaryKey(url)
        if (key) refKeys.add(key)
      }
    }
    for (const [publicId, mediaKey] of mediaById) {
      for (const refKey of refKeys) {
        if (sameMedia(mediaKey, refKey)) {
          counts.set(publicId, counts.get(publicId) + 1)
          break
        }
      }
    }
  }

  return counts
}

exports.getMedia = async (query = {}) => {
  const resources = await listCloudinaryMedia(query)
  const media = resources.map(formatCloudResource)
  const referenceCounts = await countMediaUsage(media)

  const usageRows = await MediaUsage.findAll({ raw: true })
  const usageById = new Map(usageRows.map((r) => [r.public_id, r]))

  return media.map((m) => {
    const refCount = referenceCounts.get(m.publicId) || 0
    const usage = usageById.get(m.publicId)
    const interactionCount = (usage?.downloads || 0) + (usage?.views || 0)
    return { ...m, usedIn: refCount + interactionCount }
  })
}

// Tambah interaksi (download / lihat di tab baru) untuk satu media.
exports.recordUsage = async (publicId, type) => {
  if (!publicId) {
    throw new AppError("public_id wajib diisi", 400)
  }
  if (!["download", "view"].includes(type)) {
    throw new AppError("Tipe interaksi tidak valid", 400)
  }

  const [row] = await MediaUsage.findOrCreate({
    where: { public_id: publicId },
    defaults: { downloads: 0, views: 0 },
  })

  if (type === "download") row.downloads += 1
  else row.views += 1

  await row.save()
  return { publicId, downloads: row.downloads, views: row.views }
}

exports.uploadMedia = async (file) => {
  if (!file) {
    throw new AppError("File wajib diupload", 400)
  }

  const mimetype = file.mimetype || ""
  const resourceType = mimetype.startsWith("image/") ? "image" : "raw"

  const result = await uploadImage(file.buffer, CLOUD_FOLDER, {
    resource_type: resourceType,
    filename: file.originalname,
    use_filename: true,
  })

  return formatCloudResource(result)
}

exports.deleteMedia = async (publicId) => {
  if (!publicId) {
    throw new AppError("public_id wajib diisi", 400)
  }

  let result = await deleteImage(publicId)

  // Resource raw tidak bisa dihapus lewat resource_type image (default
  // destroy), jadi coba sekali lagi dengan resource_type raw.
  if (result && result.result === "not found") {
    result = await deleteImage(publicId, { resource_type: "raw" })
  }

  if (result && result.result === "not found") {
    throw new AppError("Media tidak ditemukan", 404)
  }

  return true
}