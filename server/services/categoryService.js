const { Category, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const cache = require("../utils/cache")

const CATEGORIES_TTL = 60 * 1000
const CATEGORIES_KEY = "categories:list"

exports.getCategories = async () => {
  const cached = await cache.get(CATEGORIES_KEY)
  if (cached) return cached

  const categories = await Category.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM projects WHERE projects.category_id = Category.id AND projects.status = 'published')",
          ),
          "projectCount",
        ],
      ],
    },
    order: [
      ["sort_order", "ASC"],
      ["name", "ASC"],
    ],
  })

  await cache.set(CATEGORIES_KEY, categories, CATEGORIES_TTL)

  return categories
}

// Kategori yang aktif & urut sesuai hall 3D (hanya yang ditampilkan di hall).
exports.getActiveCategories = async () => {
  return await Category.findAll({
    where: { is_active: true },
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM projects WHERE projects.category_id = Category.id AND projects.status = 'published')",
          ),
          "projectCount",
        ],
      ],
    },
    order: [
      ["sort_order", "ASC"],
      ["name", "ASC"],
    ],
  })
}

exports.getCategoryById = async (id) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  return category
}

exports.createCategory = async (data) => {
  const { name, slug, description, icon, color, sort_order, is_active } = data

  if (!name || !slug) {
    throw new AppError("Nama dan slug wajib diisi", 400)
  }

  const nameExists = await Category.findOne({
    where: { name },
  })

  if (nameExists) {
    throw new AppError("Nama kategori sudah digunakan", 400)
  }

  const slugExists = await Category.findOne({
    where: { slug },
  })

  if (slugExists) {
    throw new AppError("Slug sudah digunakan", 400)
  }

  const category = await Category.create({
    name,
    slug,
    description: description || null,
    icon: icon || null,
    color: color || null,
    sort_order: sort_order ?? 0,
    is_active: is_active ?? true,
  })

  await cache.del(CATEGORIES_KEY)

  return category
}

exports.updateCategory = async (id, data) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  const {
    name,
    slug,
    description,
    icon,
    color,
    sort_order,
    is_active,
  } = data

  if (name && name !== category.name) {
    const exists = await Category.findOne({
      where: { name },
    })

    if (exists) {
      throw new AppError("Nama kategori sudah digunakan", 400)
    }
  }

  if (slug && slug !== category.slug) {
    const exists = await Category.findOne({
      where: { slug },
    })

    if (exists) {
      throw new AppError("Slug sudah digunakan", 400)
    }
  }

  category.name = name ?? category.name
  category.slug = slug ?? category.slug
  category.description = description ?? category.description
  category.icon = icon ?? category.icon
  category.color = color ?? category.color
  category.sort_order = sort_order ?? category.sort_order
  category.is_active = is_active ?? category.is_active

  await category.save()

  await cache.del(CATEGORIES_KEY)

  return category
}

exports.deleteCategory = async (id) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  try {
    await category.destroy()
    await cache.del(CATEGORIES_KEY)
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("Kategori masih digunakan oleh project", 400)
    }

    throw error
  }
}
