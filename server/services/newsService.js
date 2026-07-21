const { News, User } = require("../models")
const AppError = require("../utils/AppError")
const { Op } = require("sequelize")

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

  return {
    items: rows,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total: count,
      totalPages: Math.ceil(count / currentLimit),
    },
  }
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

  return news
}

exports.createNews = async (data, userId) => {
  const { title, slug, headline_image, content, status } = data

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
    content,
    status: status ?? "draft",
    published_at: status === "published" ? new Date() : null,
    author_id: userId,
  })

  return await exports.getNewsById(news.id)
}

exports.updateNews = async (id, data) => {
  const news = await News.findByPk(id)

  if (!news) {
    throw new AppError("News tidak ditemukan", 404)
  }

  const { title, slug, headline_image, content, status } = data

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
  news.content = content ?? news.content
  news.status = status ?? news.status

  await news.save()

  return news
}

exports.deleteNews = async (id) => {
  const news = await exports.getNewsById(id)

  await News.destroy({ where: { id } })

  return news
}
