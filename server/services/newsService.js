const { News, User } = require("../models")
const AppError = require("../utils/AppError")
const { Op } = require("sequelize")
const cache = require("../utils/cache")

const NEWS_LIST_TTL = 60 * 1000

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

  const currentPage = parseInt(page) || 1
  const currentLimit = parseInt(limit) || 10
  const offset = (currentPage - 1) * currentLimit

  const isUnfiltered = !search && !status && !from && !to

  if (isUnfiltered) {
    const cacheKey = `news:list:${currentPage}:${currentLimit}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached
  }

  const { count, rows } = await News.findAndCountAll({
    where,
    include: [
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: currentLimit,
    offset,
    distinct: true,
  })

  const result = {
    items: rows.map(toJSON),
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count,
      totalPages: Math.ceil(count / currentLimit),
    },
  }

  if (isUnfiltered) {
    await cache.set(`news:list:${currentPage}:${currentLimit}`, result, NEWS_LIST_TTL)
  }

  return result
}

exports.getNewsById = async (id) => {
  const news = await News.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
    ],
  })

  if (!news) {
    throw new AppError("News tidak ditemukan", 404)
  }

  return toJSON(news)
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

  await cache.delPrefix("news:list:")

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

  await cache.delPrefix("news:list:")

  return exports.getNewsById(id)
}

exports.deleteNews = async (id) => {
  const news = await exports.getNewsById(id)

  await News.destroy({ where: { id } })

  await cache.delPrefix("news:list:")

  return news
}
