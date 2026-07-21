const { Project, Category, User, ProjectImage } = require("../models")
const AppError = require("../utils/AppError")
const { Op } = require("sequelize")

exports.getProjects = async (query = {}) => {
  const { search, category_id, status, year, page, limit } = query

  const andConditions = []

  if (search) {
    andConditions.push({
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { "$User.name$": { [Op.like]: `%${search}%` } },
      ],
    })
  }

  if (category_id) {
    andConditions.push({ category_id })
  }

  if (status) {
    andConditions.push({ status })
  }

  if (year) {
    andConditions.push({ year })
  }

  const where = andConditions.length > 0 ? { [Op.and]: andConditions } : {}

  const currentPage = parseInt(page) || 1
  const currentLimit = parseInt(limit) || 10
  const offset = (currentPage - 1) * currentLimit

  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
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

exports.getPendingProjects = async () => {
  return await Project.findAll({
    where: {
      status: "pending",
    },
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
      },
    ],
    order: [["created_at", "ASC"]],
  })
}

exports.getProjectById = async (id) => {
  const project = await Project.findByPk(id, {
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
      {
        model: User,
        attributes: ["id", "name", "username"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
      },
    ],
  })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  return project
}

exports.createProject = async (data, user, imageUrls = []) => {
  const { title, slug, description, thumbnail, year, category_id } = data

  if (!title || !slug || !description || !thumbnail || !year || !category_id) {
    throw new AppError("Semua field wajib diisi", 400)
  }

  const slugExists = await Project.findOne({
    where: { slug },
  })

  if (slugExists) {
    throw new AppError("Slug sudah digunakan", 400)
  }

  const category = await Category.findByPk(category_id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  // User umum tidak boleh upload
  if (user.tipe === "umum") {
    throw new AppError(
      "Pengguna umum tidak memiliki izin untuk mengunggah project",
      403,
    )
  }

  // Tentukan status berdasarkan tipe user
  const projectStatus =
    user.role === "admin" || user.tipe === "dosen" ? "published" : "pending"

  const project = await Project.create({
    title,
    slug,
    description,
    thumbnail,
    year,
    category_id,
    status: projectStatus,
    user_id: user.id,
  })

  if (imageUrls.length > 0) {
    const imagesData = imageUrls.map((url) => ({
      image_url: url,
      project_id: project.id,
    }))

    await ProjectImage.bulkCreate(imagesData)
  }

  return await exports.getProjectById(project.id)
}

exports.updateProject = async (id, data, user) => {
  const project = await Project.findByPk(id)

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  // Admin boleh mengedit semua project.
  // User hanya boleh mengedit project miliknya sendiri.
  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const { title, slug, description, thumbnail, year, category_id, status } =
    data

  if (slug && slug !== project.slug) {
    const slugExists = await Project.findOne({
      where: { slug },
    })

    if (slugExists) {
      throw new AppError("Slug sudah digunakan", 400)
    }
  }

  if (category_id) {
    const category = await Category.findByPk(category_id)

    if (!category) {
      throw new AppError("Kategori tidak ditemukan", 404)
    }
  }

  project.title = title ?? project.title
  project.slug = slug ?? project.slug
  project.description = description ?? project.description
  project.thumbnail = thumbnail ?? project.thumbnail
  project.year = year ?? project.year
  project.category_id = category_id ?? project.category_id

  if (user.role === "admin") {
    project.status = status ?? project.status
  }

  await project.save()

  return project
}

exports.deleteProject = async (id, user) => {
  const project = await exports.getProjectById(id)

  // Admin boleh menghapus semua project.
  // User hanya boleh menghapus project miliknya sendiri.
  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  await Project.destroy({
    where: { id },
  })

  return project
}
