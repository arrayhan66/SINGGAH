const { Category } = require("../models")
const AppError = require("../utils/AppError")

exports.getCategories = async () => {
  return await Category.findAll({
    order: [["name", "ASC"]],
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
  const { name, slug } = data

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

  return await Category.create({
    name,
    slug,
  })
}

exports.updateCategory = async (id, data) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  const { name, slug } = data

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

  await category.save()

  return category
}

exports.deleteCategory = async (id) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  try {
    await category.destroy()
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("Kategori masih digunakan oleh project", 400)
    }

    throw error
  }
}
