const { News, User } = require("../models")
const AppError = require("../utils/AppError")
const { Op } = require("sequelize")
const cache = require("../utils/cache")
const singleFlight = require("../utils/singleFlight")
const { parsePagination } = require("../utils/pagination")
const { countWithCache } = require("../utils/countCache")

const NEWS_LIST_TTL = 60 * 1000
const NEWS_TOTAL_KEY = "count:news:total"

// Halaman daftar berita tidak menampilkan isi artikel, hanya judul, ringkasan,
// dan gambar.(contentHTML tidak dikirim di daftar.)
//
// Field ini dikecualikan karena isinya bisa sangat besar: contentHTML menyimpan
// HTML hasil editor yang bisa memuat gambar inline sebagai base64. Satu data
// yang diukur punya contentHTML 956 KB, dan itu 99,6% di antaranya satu PNG
// base64. Empat berita jadi 1,16 MB untuk satu respons daftar, dan
// News.findAll mentok di 10 req/s hanya karena memindahkan data sebesar itu.
//
// Isi artikel diambil lewat /api/news/:id atau /api/news/slug/:slug.
const LIST_EXCLUDED_ATTRIBUTES = ["contentHTML"]

// Dipanggil setiap ada berita yang berubah. Selain daftar, total berita juga
// ikut dibersihkan karena sekarang disimpan di cache terpisah.
async function invalidateNewsCaches() {
  await cache.delPrefix("news:list:")
  await cache.delPrefix("news:detail:")
  await cache.del(NEWS_TOTAL_KEY)
}

const parseJson = (value) => {
  if (value === null || value === undefined || value === "") return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const toJSON = (news) => {
  const data = news.toJSON()
  data.tags = parseJson(data.tags)
  data.gallery = parseJson(data.gallery)
  data.content = parseJson(data.content)
  return data
}

exports.getNews = async (query = {}) => {
  const { search, status, from, to, page, limit } = query

  const andConditions = []
  if (search) {
    andConditions.push({
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { "$User.name$": { [Op.like]: `%${search}%` } },
      ],
    })
  }

  if (status) {
    andConditions.push({ status })
  }

  if (from && to) {
    andConditions.push({ created_at: { [Op.between]: [from, to] } })
  } else if (from) {
    andConditions.push({ created_at: { [Op.gte]: from } })
  } else if (to) {
    andConditions.push({ created_at: { [Op.lte]: to } })
  }

  const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {}

  // Route /api/news tidak memakai authMiddleware, jadi tidak ada role di
  // sini. Batas publik (100) juga sudah cukup untuk halaman admin berita
  // karena BeritaContext mengambil per halaman.
  const { page: currentPage, limit: currentLimit, offset } = parsePagination(
    { page, limit },
    { defaultLimit: 10 },
  )

  const isUnfiltered = !search && !status && !from && !to
  const listKey = `news:list:${currentPage}:${currentLimit}`

  if (isUnfiltered) {
    const cached = await cache.get(listKey)
    if (cached) return cached
  }

  const rowQuery = {
    where,
    attributes: { exclude: LIST_EXCLUDED_ATTRIBUTES },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: currentLimit,
    offset,
  }

  const build = async () => {
    let total
    let rows

    if (isUnfiltered) {
      // Tanpa filter, total berita tidak perlu dihitung ulang tiap request.
      //_findAll dipisah dari count supaya satu request hanya memakai satu
      // koneksi database, bukan dua (lihat utils/countCache.js).
      total = await countWithCache(NEWS_TOTAL_KEY, () => News.count())
      rows = await News.findAll(rowQuery)
    } else {
      // Jalur berfilter tetap memakai findAndCountAll karena itu yang
      // menerjemahkan "$User.name$" di klausa where dengan benar.
      const counted = await News.findAndCountAll({ ...rowQuery, distinct: true })
      total = counted.count
      rows = counted.rows
    }

    const result = {
      items: rows.map(toJSON),
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    }

    if (isUnfiltered) {
      await cache.set(listKey, result, NEWS_LIST_TTL)
    }

    return result
  }

  if (!isUnfiltered) return build()

  // Single flight: saat cache baru saja kosong dan banyak orang membuka
  // halaman berita bersamaan, tanpa ini satu ledakan query identik.
  return singleFlight(listKey, async () => {
    const afterWait = await cache.get(listKey)
    if (afterWait) return afterWait
    return build()
  })
}

const NEWS_DETAIL_INCLUDE = [
  {
    model: User,
    attributes: ["id", "name", "username"],
  },
]

exports.getNewsById = async (id) => {
  const news = await News.findByPk(id, {
    include: NEWS_DETAIL_INCLUDE,
  })

  if (!news) {
    throw new AppError("News tidak ditemukan", 404)
  }

  return toJSON(news)
}

// Halaman detail berita bekerja dengan slug, bukan id, jadi perlu endpoint
// berdasarkan slug. Ini yang mengambil contentHTML: field itu sengaja
// dikecualikan dari daftar (/api/news) supaya daftar tidak ikut megabytes.
//
// Cache memakai TTL pendek karena satu berita bisa Diedit admin; 30 detik
// kesalaan baru berlaku setelah perubahan.
const NEWS_DETAIL_TTL = 30 * 1000

exports.getNewsBySlug = async (slug) => {
  if (!slug) {
    throw new AppError("Slug berita tidak valid", 400)
  }

  const cacheKey = `news:detail:${slug}`

  const cached = await cache.get(cacheKey)
  if (cached) return cached

  const news = await News.findOne({
    where: { slug },
    include: NEWS_DETAIL_INCLUDE,
  })

  if (!news) {
    throw new AppError("News tidak ditemukan", 404)
  }

  const result = toJSON(news)
  await cache.set(cacheKey, result, NEWS_DETAIL_TTL)

  return result
}

const serialize = (value) => {
  if (value === undefined || value === null || value === "") return null
  return typeof value === "string" ? value : JSON.stringify(value)
}

exports.createNews = async (data, userId) => {
  const {
    title,
    slug,
    headline_image,
    winner,
    date,
    source,
    summary,
    desc,
    tags,
    gallery,
    content,
    contentHTML,
    status,
  } = data

  if (!title || !slug || !headline_image || !content) {
    throw new AppError("Semua field wajib diisi", 400)
  }

  const slugExists = await News.findOne({
    where: { slug },
  })

  if (slugExists) {
    throw new AppError("Slug sudah digunakan", 400)
  }

  const news = await News.create({
    title,
    slug,
    headline_image,
    winner: winner || null,
    date: date || null,
    source: source || null,
    summary: summary || desc || null,
    tags: serialize(tags),
    gallery: serialize(gallery),
    content,
    contentHTML: contentHTML || null,
    status: status ?? "draft",
    published_at: status === "published" ? new Date() : null,
    author_id: userId,
  })

  await invalidateNewsCaches()

  return await exports.getNewsById(news.id)
}

exports.updateNews = async (id, data) => {
  const news = await News.findByPk(id)

  if (!news) {
    throw new AppError("News tidak ditemukan", 404)
  }

  const {
    title,
    slug,
    headline_image,
    winner,
    date,
    source,
    summary,
    desc,
    tags,
    gallery,
    content,
    contentHTML,
    status,
  } = data

  if (slug && slug !== news.slug) {
    const slugExists = await News.findOne({
      where: { slug },
    })

    if (slugExists) {
      throw new AppError("Slug sudah digunakan", 400)
    }
  }

  if (
    status === "published" &&
    news.status !== "published" &&
    !news.published_at
  ) {
    news.published_at = new Date()
  }

  news.title = title ?? news.title
  news.slug = slug ?? news.slug
  news.headline_image = headline_image ?? news.headline_image
  news.winner = winner ?? news.winner
  news.date = date ?? news.date
  news.source = source ?? news.source
  news.summary = summary || desc || news.summary
  news.tags = tags === undefined ? news.tags : serialize(tags)
  news.gallery = gallery === undefined ? news.gallery : serialize(gallery)
  news.content = content ?? news.content
  news.contentHTML = contentHTML === undefined ? news.contentHTML : (contentHTML || null)
  news.status = status ?? news.status

  await news.save()

  await invalidateNewsCaches()

  return exports.getNewsById(id)
}

exports.deleteNews = async (id) => {
  const news = await exports.getNewsById(id)

  await News.destroy({ where: { id } })

  await invalidateNewsCaches()

  return news
}
