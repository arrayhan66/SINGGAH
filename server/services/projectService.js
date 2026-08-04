const {
  Project,
  Category,
  User,
  ProjectImage,
  ProjectMember,
  ProjectDocument,
  ProjectTechnology,
  ProjectVideo,
  ProjectLink,
  ProjectLike,
  ProjectView,
  Bookmark,
  Comment,
  sequelize,
} = require("../models")
const AppError = require("../utils/AppError")
const { Op } = require("sequelize")
const { createNotification } = require("./notificationService")

const parseJsonField = (value, label) => {
  if (value === undefined || value === null || value === "") return []

  if (Array.isArray(value)) return value

  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      throw new AppError(`${label} tidak valid`, 400)
    }
  }

  throw new AppError(`${label} tidak valid`, 400)
}

const generateUniqueSlug = async (title) => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)

  let slug = baseSlug || "project"
  let suffix = 1

  while (await Project.findOne({ where: { slug } })) {
    slug = `${baseSlug || "project"}-${suffix}`
    suffix += 1
  }

  return slug
}

const replaceRelated = async (projectId, Model, rows, options = {}) => {
  await Model.destroy({ where: { project_id: projectId }, ...options })

  if (rows.length > 0) {
    await Model.bulkCreate(rows, options)
  }
}

const parseRelationFields = (data) => {
  const technologies = parseJsonField(data.technologies, "Teknologi").map(
    (item) => ({
      name:
        typeof item === "string"
          ? item
          : item.name || item.technology || String(item),
    }),
  )
  const members = parseJsonField(data.members, "Anggota tim").map((item) => ({
    name: item.name,
    role: item.role || null,
  }))
  const links = parseJsonField(data.links, "Link eksternal").map((item) => ({
    label: item.label,
    url: item.url,
  }))
  const videos = parseJsonField(data.videos, "Video").map((item) => ({
    video_url:
      typeof item === "string"
        ? item
        : item.video_url || item.url || String(item),
  }))

  return { technologies, members, links, videos }
}

const persistRelations = async (project, relations, options = {}) => {
  const attach = (rows) =>
    rows.map((row) => ({ ...row, project_id: project.id }))

  await replaceRelated(
    project.id,
    ProjectTechnology,
    attach(relations.technologies),
    options,
  )
  await replaceRelated(
    project.id,
    ProjectMember,
    attach(relations.members),
    options,
  )
  await replaceRelated(
    project.id,
    ProjectLink,
    attach(relations.links),
    options,
  )
  await replaceRelated(
    project.id,
    ProjectVideo,
    attach(relations.videos),
    options,
  )
}

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
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM project_likes WHERE project_likes.project_id = Project.id)",
          ),
          "likesCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM project_views WHERE project_views.project_id = Project.id)",
          ),
          "viewsCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = Project.id)",
          ),
          "bookmarksCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.project_id = Project.id)",
          ),
          "commentsCount",
        ],
      ],
    },
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
      {
        model: User,
        attributes: ["id", "name", "username", "nim_nip", "avatar"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
      },
      {
        model: ProjectTechnology,
        as: "technologies",
        attributes: ["id", "name"],
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
        attributes: ["id", "name", "username", "nim_nip", "avatar"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
      },
      {
        model: ProjectTechnology,
        as: "technologies",
        attributes: ["id", "name"],
      },
    ],
    order: [["created_at", "ASC"]],
  })
}

exports.updateProjectStatus = async (id, status) => {
  const project = await Project.findByPk(id)

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  if (!["pending", "published", "rejected"].includes(status)) {
    throw new AppError("Status tidak valid", 400)
  }

  await sequelize.transaction(async (t) => {
    project.status = status
    await project.save({ transaction: t })

    if (status === "published") {
      await createNotification(
        {
          user_id: project.user_id,
          type: "project_approved",
          title: "Project disetujui",
          message: `Project "${project.title}" telah disetujui dan dipublikasikan.`,
          reference_type: "project",
          reference_id: project.id,
        },
        { transaction: t },
      )
    }

    if (status === "rejected") {
      await createNotification(
        {
          user_id: project.user_id,
          type: "project_rejected",
          title: "Project ditolak",
          message: `Project "${project.title}" ditolak oleh admin.`,
          reference_type: "project",
          reference_id: project.id,
        },
        { transaction: t },
      )
    }
  })

  return project
}

exports.getProjectById = async (id, currentUserId = null) => {
  const project = await Project.findByPk(id, {
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM project_likes WHERE project_likes.project_id = Project.id)",
          ),
          "likesCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM project_views WHERE project_views.project_id = Project.id)",
          ),
          "viewsCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = Project.id)",
          ),
          "bookmarksCount",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.project_id = Project.id)",
          ),
          "commentsCount",
        ],
      ],
    },
    include: [
      {
        model: Category,
        attributes: ["id", "name", "slug"],
      },
      {
        model: User,
        attributes: ["id", "name", "username", "nim_nip", "avatar"],
      },
      {
        model: ProjectImage,
        as: "images",
        attributes: ["id", "image_url"],
      },
      {
        model: ProjectMember,
        as: "members",
        attributes: ["id", "name", "role"],
      },
      {
        model: ProjectTechnology,
        as: "technologies",
        attributes: ["id", "name"],
      },
      {
        model: ProjectDocument,
        as: "documents",
        attributes: ["id", "name", "file_url"],
      },
      {
        model: ProjectVideo,
        as: "videos",
        attributes: ["id", "video_url"],
      },
      {
        model: ProjectLink,
        as: "links",
        attributes: ["id", "label", "url"],
      },
    ],
  })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  const data = project.toJSON()

  data.liked = false
  data.bookmarked = false

  if (currentUserId) {
    const [like, bookmark] = await Promise.all([
      ProjectLike.findOne({
        where: { project_id: project.id, user_id: currentUserId },
      }),
      Bookmark.findOne({
        where: { project_id: project.id, user_id: currentUserId },
      }),
    ])

    data.liked = !!like
    data.bookmarked = !!bookmark
  }

  return data
}

exports.createProject = async (data, user, imageUrls = [], documentUrls = []) => {
  const { title, slug, description, thumbnail, year, category_id } = data

  if (!title || !description || !thumbnail || !year || !category_id) {
    throw new AppError("Semua field wajib diisi", 400)
  }

  const finalSlug = slug || (await generateUniqueSlug(title))

  const slugExists = await Project.findOne({
    where: { slug: finalSlug },
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

  // Parse & validasi relasi SEBELUM menulis ke database
  const relations = parseRelationFields(data)

  // Tentukan status berdasarkan tipe user
  const projectStatus =
    user.role === "admin" || user.tipe === "dosen" ? "published" : "pending"

  const project = await sequelize.transaction(async (t) => {
    const created = await Project.create(
      {
        title,
        slug: finalSlug,
        description,
        thumbnail,
        year,
        category_id,
        status: projectStatus,
        user_id: user.id,
      },
      { transaction: t },
    )

    if (imageUrls.length > 0) {
      await ProjectImage.bulkCreate(
        imageUrls.map((url) => ({
          image_url: url,
          project_id: created.id,
        })),
        { transaction: t },
      )
    }

    if (documentUrls.length > 0) {
      await ProjectDocument.bulkCreate(
        documentUrls.map(({ name, file_url }) => ({
          name,
          file_url,
          project_id: created.id,
        })),
        { transaction: t },
      )
    }

    await persistRelations(created, relations, { transaction: t })

    return created
  })

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

  const relations = parseRelationFields(data)

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

  await sequelize.transaction(async (t) => {
    project.title = title ?? project.title
    project.slug = slug ?? project.slug
    project.description = description ?? project.description
    project.thumbnail = thumbnail ?? project.thumbnail
    project.year = year ?? project.year
    project.category_id = category_id ?? project.category_id

    if (user.role === "admin") {
      project.status = status ?? project.status
    }

    await project.save({ transaction: t })

    await persistRelations(project, relations, { transaction: t })
  })

  return await exports.getProjectById(id)
}

exports.deleteProject = async (id, user) => {
  const project = await exports.getProjectById(id)

  // Admin boleh menghapus semua project.
  // User hanya boleh menghapus project miliknya sendiri.
  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const childModels = [
    ProjectImage,
    ProjectMember,
    ProjectDocument,
    ProjectTechnology,
    ProjectVideo,
    ProjectLink,
    ProjectLike,
    ProjectView,
    Bookmark,
    Comment,
  ]

  await sequelize.transaction(async (t) => {
    await Promise.all(
      childModels.map((Model) =>
        Model.destroy({ where: { project_id: id }, transaction: t }),
      ),
    )

    await Project.destroy({
      where: { id },
      transaction: t,
    })
  })

  return project
}

exports.getMyProjects = async (userId) => {
  const [items, pending, published, rejected, total] = await Promise.all([
    Project.findAll({
      where: { user_id: userId },
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM project_likes WHERE project_likes.project_id = Project.id)",
            ),
            "likesCount",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM project_views WHERE project_views.project_id = Project.id)",
            ),
            "viewsCount",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM bookmarks WHERE bookmarks.project_id = Project.id)",
            ),
            "bookmarksCount",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM comments WHERE comments.project_id = Project.id)",
            ),
            "commentsCount",
          ],
        ],
      },
      include: [
        {
          model: Category,
          attributes: ["id", "name", "slug"],
        },
        {
          model: User,
          attributes: ["id", "name", "username", "nim_nip", "avatar"],
        },
        {
          model: ProjectImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: ProjectTechnology,
          as: "technologies",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      distinct: true,
    }),
    Project.count({ where: { user_id: userId, status: "pending" } }),
    Project.count({ where: { user_id: userId, status: "published" } }),
    Project.count({ where: { user_id: userId, status: "rejected" } }),
    Project.count({ where: { user_id: userId } }),
  ])

  return {
    items,
    counts: { pending, published, rejected, total },
  }
}
