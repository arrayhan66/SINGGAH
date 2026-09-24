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
const { toEmbedUrl } = require("../utils/videoUrl")
const { Op } = require("sequelize")
const { createNotification, notifyAdmins } = require("./notificationService")
const cache = require("../utils/cache")

const SLIDESHOW_MAX_ITEMS = 6

// Batas tampilan karya mahasiswa per kategori di Hall 3D (lantai 1).
// Lantai 1 menampung maksimal 48 karya per kategori. Karya selain dosen
// (mahasiswa/admin/umum) diklasifikasikan ke grup mahasiswa oleh hall,
// sehingga ikut mengisi slot ini.
const CATEGORY_MAHASISWA_LIMIT = 48

// Batas tampilan karya dosen per kategori di Hall 3D (lantai 2). Dinding
// lantai 2 menampung maksimal 48 karya (2 unggulan di podium + sisanya di
// dinding), jadi karya dosen per kategori juga dibatasi 48.
const CATEGORY_DOSEN_LIMIT = 48

// Penghitungan slot harus konsisten dengan klasifikasi hall: sebuah karya
// masuk grup dosen jika author_tipe = 'dosen' ATAU pemiliknya bertipe dosen
// (untuk karya lama tanpa author_tipe). Sisanya dihitung sebagai mahasiswa.
// Ini membuat karya yang diupload admin atas nama dosen terhitung ke slot
// dosen, bukan slot mahasiswa.
async function countMahasiswaSlots(categoryId, excludeId = null) {
  return Number(
    (
      await sequelize.query(
        `SELECT COUNT(*) AS total
           FROM projects p
           JOIN users u ON u.id = p.user_id
          WHERE p.category_id = :categoryId
            AND p.status = 'published'
            ${excludeId !== null ? "AND p.id != :excludeId" : ""}
            AND COALESCE(p.author_tipe, u.tipe) != 'dosen'`,
        {
          replacements: {
            categoryId,
            ...(excludeId !== null ? { excludeId } : {}),
          },
          type: sequelize.QueryTypes.SELECT,
        },
      )
    )[0].total,
  )
}

async function assertMahasiswaSlot(categoryId, excludeId = null) {
  const used = await countMahasiswaSlots(categoryId, excludeId)
  if (used >= CATEGORY_MAHASISWA_LIMIT) {
    throw new AppError(
      `Karya pada kategori ini sudah mencapai limit (${CATEGORY_MAHASISWA_LIMIT} karya mahasiswa) di Hall. Tidak ada slot kosong — hapus salah satu karya mahasiswa dulu agar karya baru bisa dipublikasikan.`,
      409,
    )
  }
}

async function countDosenSlots(categoryId, excludeId = null) {
  return Number(
    (
      await sequelize.query(
        `SELECT COUNT(*) AS total
           FROM projects p
           JOIN users u ON u.id = p.user_id
          WHERE p.category_id = :categoryId
            AND p.status = 'published'
            ${excludeId !== null ? "AND p.id != :excludeId" : ""}
            AND COALESCE(p.author_tipe, u.tipe) = 'dosen'`,
        {
          replacements: {
            categoryId,
            ...(excludeId !== null ? { excludeId } : {}),
          },
          type: sequelize.QueryTypes.SELECT,
        },
      )
    )[0].total,
  )
}

async function assertDosenSlot(categoryId, excludeId = null) {
  const used = await countDosenSlots(categoryId, excludeId)
  if (used >= CATEGORY_DOSEN_LIMIT) {
    throw new AppError(
      `Karya dosen pada kategori ini sudah mencapai limit (${CATEGORY_DOSEN_LIMIT} karya dosen) di Hall. Tidak ada slot kosong — hapus salah satu karya dosen dulu agar karya baru bisa dipublikasikan.`,
      409,
    )
  }
}

// ---- Shape bersama agar response project konsisten dengan kebutuhan hall 3D ----
const PROJECT_COUNT_ATTRIBUTES = [
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
      "(SELECT COUNT(*) FROM comments WHERE comments.project_id = Project.id) + (SELECT COUNT(*) FROM comment_replies WHERE comment_replies.comment_id IN (SELECT id FROM comments WHERE comments.project_id = Project.id))",
    ),
    "commentsCount",
  ],
]

const CATEGORY_INCLUDE = {
  model: Category,
  attributes: [
    "id",
    "name",
    "slug",
    "description",
    "icon",
    "color",
    "sort_order",
    "is_active",
  ],
}

const USER_INCLUDE = {
  model: User,
  attributes: ["id", "name", "username", "nim_nip", "avatar", "tipe"],
}

// Tipe penulis efektif sebuah karya: field author_tipe (yang diatur admin)
// menang; jika kosong, ikuti tipe akun pembuat. Konsisten dengan pengelompokan
// hall (COALESCE(author_tipe, user.tipe)) di mana non-dosen = mahasiswa.
const resolveAuthorType = (project) =>
  (project.author_tipe || project.User?.tipe) === "dosen" ? "dosen" : "mahasiswa"

const IMAGES_INCLUDE = {
  model: ProjectImage,
  as: "images",
  attributes: ["id", "image_url"],
}

const MEMBERS_INCLUDE = {
  model: ProjectMember,
  as: "members",
  attributes: ["id", "name", "role"],
}

const TECHNOLOGIES_INCLUDE = {
  model: ProjectTechnology,
  as: "technologies",
  attributes: ["id", "name"],
}

const DOCUMENTS_INCLUDE = {
  model: ProjectDocument,
  as: "documents",
  attributes: ["id", "name", "file_url"],
}

const VIDEOS_INCLUDE = {
  model: ProjectVideo,
  as: "videos",
  attributes: ["id", "video_url"],
}

const LINKS_INCLUDE = {
  model: ProjectLink,
  as: "links",
  attributes: ["id", "label", "url"],
}

// Konversi instance Sequelize ke plain object + field `category` (slug) di
// level atas, persis seperti yang dipakai komponen hall 3D (Painting,
// ProjectDetailModal, hallHelpers) yaitu project.category / project.Category.slug.
const toProjectJSON = (row) => {
  const data = row.toJSON?.() || row
  return { ...data, category: data.Category?.slug || null }
}

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
    video_url: toEmbedUrl(
      typeof item === "string"
        ? item
        : item.video_url || item.url || String(item),
    ),
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

// Sisipkan status like/bookmark user ke daftar project (untuk kartu di list,
// supaya heart/bookmark tetap terisi setelah navigasi bolak-balik).
async function applyUserFlags(items, userId) {
  if (!userId || !items.length) {
    return items.map((item) => ({ ...item, liked: false, bookmarked: false }))
  }

  const ids = items.map((item) => item.id)

  const [likes, bookmarks] = await Promise.all([
    ProjectLike.findAll({
      where: { user_id: userId, project_id: { [Op.in]: ids } },
      attributes: ["project_id"],
    }),
    Bookmark.findAll({
      where: { user_id: userId, project_id: { [Op.in]: ids } },
      attributes: ["project_id"],
    }),
  ])

  const likedIds = new Set(likes.map((like) => like.project_id))
  const bookmarkedIds = new Set(bookmarks.map((bookmark) => bookmark.project_id))

  return items.map((item) => ({
    ...item,
    liked: likedIds.has(item.id),
    bookmarked: bookmarkedIds.has(item.id),
  }))
}

exports.getProjects = async (query = {}, currentUserId = null, userRole = null) => {
  const { search, category_id, status, year, slideshow, page, limit } = query

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

  if (slideshow === "true" || slideshow === "1") {
    andConditions.push({ is_shown_in_slideshow: true })
  }

  if (status) {
    andConditions.push({ status })
  } else if (userRole !== "admin") {
    andConditions.push({ status: "published" })
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
      include: PROJECT_COUNT_ATTRIBUTES,
    },
    include: [
      CATEGORY_INCLUDE,
      USER_INCLUDE,
      IMAGES_INCLUDE,
      TECHNOLOGIES_INCLUDE,
    ],
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    limit: currentLimit,
    offset,
    distinct: true,
  })

  return {
    items: await applyUserFlags(rows.map(toProjectJSON), currentUserId),
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
      CATEGORY_INCLUDE,
      USER_INCLUDE,
      IMAGES_INCLUDE,
      TECHNOLOGIES_INCLUDE,
    ],
    order: [["created_at", "ASC"]],
  })
}

exports.updateProjectStatus = async (id, status, reason = "") => {
  const where = /^\d+$/.test(String(id)) ? { id: Number(id) } : { slug: id }
  const project = await Project.findOne({
    where,
    include: [{ model: User, attributes: ["id", "tipe"] }],
  })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  if (!["pending", "published", "rejected"].includes(status)) {
    throw new AppError("Status tidak valid", 400)
  }

  // Publikasi ke Hall dibatasi per kategori: lantai 1 hanya sampai 48 karya
  // mahasiswa, lantai 2 hanya sampai 48 karya dosen.
  if (status === "published") {
    const authorTipe = project.author_tipe || project.User?.tipe
    if (authorTipe === "dosen") {
      await assertDosenSlot(project.category_id, project.id)
    } else {
      await assertMahasiswaSlot(project.category_id, project.id)
    }
  }

  const note = String(reason || "").trim()

  await sequelize.transaction(async (t) => {
    project.status = status
    project.rejection_reason =
      status === "rejected" ? note || null : null
    project.approve_note =
      status === "published" ? note || null : null
    // Karya yang tidak lagi published otomatis di-lepas dari slot unggulan,
    // supaya tidak menyandera slot (1 & 2) untuk karya lain.
    if (status !== "published") {
      project.featured_slot = null
      project.is_shown_in_slideshow = false
    }
    await project.save({ transaction: t })

    if (status === "published") {
      await createNotification(
        {
          user_id: project.user_id,
          type: "project_approved",
          title: "Project disetujui",
          message: note
            ? `Project "${project.title}" telah disetujui dan dipublikasikan. Catatan admin: ${note}`
            : `Project "${project.title}" telah disetujui dan dipublikasikan.`,
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
          message: note
            ? `Project "${project.title}" ditolak oleh admin. Alasan: ${note}`
            : `Project "${project.title}" ditolak oleh admin.`,
          reference_type: "project",
          reference_id: project.id,
        },
        { transaction: t },
      )
    }
  })

  await cache.delPrefix("categories:list")

  return project
}

// Set / hapus slot karya unggulan (1 atau 2) sebuah project.
// Slot unggulan bersifat PER PORTAL (per kategori) DAN PER TIPE PENULIS:
// satu portal punya slot 1 & 2 untuk karya mahasiswa, plus slot 1 & 2 untuk
// karya dosen → hingga 4 karya unggulan per portal (2 mahasiswa + 2 dosen).
// Slots mahasiswa tampil di podium lantai 1, slots dosen di lantai 2.
exports.setProjectFeatured = async (id, slot = null) => {
  const where = /^\d+$/.test(String(id)) ? { id: Number(id) } : { slug: id }
  const project = await Project.findOne({
    where,
    include: [
      {
        model: User,
        attributes: ["id", "name", "tipe", "nim_nip"],
      },
    ],
  })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  if (slot !== null && project.status !== "published") {
    throw new AppError(
      "Hanya project yang sudah dipublikasikan yang bisa menjadi karya unggulan",
      400,
    )
  }

  const normalizedSlot =
    slot === null || slot === undefined || slot === "" ? null : Number(slot)

  if (normalizedSlot !== null && ![1, 2].includes(normalizedSlot)) {
    throw new AppError("Slot unggulan harus 1 atau 2", 400)
  }

  const authorTipe = resolveAuthorType(project)

  await sequelize.transaction(async (t) => {
    if (normalizedSlot !== null) {
      const candidates = await Project.findAll({
        where: {
          featured_slot: normalizedSlot,
          category_id: project.category_id,
          id: { [Op.ne]: project.id },
        },
        include: [{ model: User, attributes: ["id", "tipe"] }],
        transaction: t,
      })

      // Satu slot per tipe penulis: karya dosen tidak bertabrakan dengan slot
      // mahasiswa (dan sebaliknya), sehingga 2 dosen + 2 mahasiswa dapat
      // menjadi unggulan dalam portal yang sama.
      const occupant = candidates.find(
        (p) => resolveAuthorType(p) === authorTipe,
      )

      if (occupant) {
        throw new AppError(
          `Slot ${normalizedSlot} untuk karya ${authorTipe} pada portal kategori ini sudah terisi oleh karya "${occupant.title}". Lepas dulu karya tersebut dari unggulan sebelum mengisi slot ${normalizedSlot}.`,
          409,
        )
      }
    }

    project.featured_slot = normalizedSlot
    // Karya yang dilepas dari unggulan otomatis tidak lagi tampil di
    // slideshow beranda (slideshow hanya untuk karya unggulan).
    if (normalizedSlot === null) {
      project.is_shown_in_slideshow = false
    }
    await project.save({ transaction: t })
  })

  return project
}

// Tampilkan / sembunyikan karya dari slideshow beranda (hero). Hanya karya
// published dan sedang unggulan (featured_slot terisi) yang boleh tampil.
// Jumlah maksimal dibatasi SLIDESHOW_MAX_ITEMS lintas seluruh kategori.
exports.setProjectSlideshow = async (id, visible) => {
  const where = /^\d+$/.test(String(id)) ? { id: Number(id) } : { slug: id }
  const project = await Project.findOne({ where })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  const isVisible =
    visible === true || visible === "true" || visible === 1 || visible === "1"

  if (isVisible) {
    if (project.status !== "published") {
      throw new AppError(
        "Hanya project yang sudah dipublikasikan yang bisa tampil di slideshow beranda",
        400,
      )
    }

    if (!project.featured_slot) {
      throw new AppError(
        "Tandai karya ini sebagai Unggulan terlebih dahulu sebelum dimunculkan di slideshow beranda",
        400,
      )
    }

    const activeCount = await Project.count({
      where: {
        is_shown_in_slideshow: true,
        status: "published",
        id: { [Op.ne]: project.id },
      },
    })

    if (activeCount >= SLIDESHOW_MAX_ITEMS) {
      throw new AppError(
        `Maksimal ${SLIDESHOW_MAX_ITEMS} karya untuk slideshow beranda. Nonaktifkan salah satu karya slideshow lain terlebih dahulu.`,
        409,
      )
    }
  }

  project.is_shown_in_slideshow = isVisible
  await project.save()

  return project
}

exports.getProjectById = async (id, currentUserId = null, currentUserRole = null, tokenInvalid = false) => {
  const where = /^\d+$/.test(id) ? { id: Number(id) } : { slug: id }

  const project = await Project.findOne({
    where,
    attributes: {
      include: PROJECT_COUNT_ATTRIBUTES,
    },
    include: [
      CATEGORY_INCLUDE,
      USER_INCLUDE,
      IMAGES_INCLUDE,
      MEMBERS_INCLUDE,
      TECHNOLOGIES_INCLUDE,
      DOCUMENTS_INCLUDE,
      VIDEOS_INCLUDE,
      LINKS_INCLUDE,
    ],
  })

  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  const isOwner = currentUserId && project.user_id === currentUserId
  const isAdmin = currentUserRole === "admin"

  if (project.status !== "published" && !isOwner && !isAdmin) {
    if (tokenInvalid) {
      throw new AppError("Sesi berakhir. Silakan masuk kembali.", 401)
    }
    throw new AppError("Project tidak ditemukan", 404)
  }

  const data = project.toJSON()

  data.category = data.Category?.slug || null
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

  // User umum tidak boleh upload — kecuali akun admin (admin memakai tipe
  // "umum") yang memang ditugaskan menambah karya mahasiswa.
  if (user.tipe === "umum" && user.role !== "admin") {
    throw new AppError(
      "Pengguna umum tidak memiliki izin untuk mengunggah project",
      403,
    )
  }

  // Admin dapat menentukan tipe penulis karya (mahasiswa/dosen) lewat field
  // author_tipe. Untuk selain admin, tipe penulis mengikuti tipe akun pembuat.
  const declaredAuthorTipe = ["mahasiswa", "dosen"].includes(data.author_tipe)
    ? data.author_tipe
    : null
  const authorTipe =
    user.role === "admin" && declaredAuthorTipe ? declaredAuthorTipe : user.tipe

  // Karya dosen & karya lain ditampilkan di Hall dengan kapasitas 48 per
  // kategori. Kalau sudah penuh, karya baru ditolak dengan pemberitahuan.
  if (authorTipe === "dosen") {
    await assertDosenSlot(category_id)
  } else {
    await assertMahasiswaSlot(category_id)
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
        author_tipe: user.role === "admin" ? declaredAuthorTipe : null,
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

    // Project pending: beri tahu semua admin agar segera di-review.
    if (projectStatus === "pending") {
      await notifyAdmins(
        {
          type: "new_project",
          title: "Karya baru menunggu persetujuan",
          message: `${user.name} mengunggah karya "${created.title}" dan menunggu persetujuan admin.`,
          reference_type: "project",
          reference_id: created.id,
        },
        { transaction: t },
      )
    }

    return created
  })

  await cache.delPrefix("categories:list")

  return await exports.getProjectById(project.id, user.id, user.role)
}

exports.updateProject = async (id, data, user) => {
  const where = /^\d+$/.test(String(id)) ? { id: Number(id) } : { slug: id }
  const project = await Project.findOne({
    where,
    include: [{ model: User, attributes: ["id", "tipe"] }],
  })

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
      // Admin bisa mengatur tipe penulis (mahasiswa/dosen) lewat author_tipe.
      if (data.author_tipe !== undefined && data.author_tipe !== null && data.author_tipe !== "") {
        if (!["mahasiswa", "dosen"].includes(data.author_tipe)) {
          throw new AppError("Tipe penulis tidak valid", 400)
        }
        project.author_tipe = data.author_tipe
      }

      if (status === "published") {
        const authorTipe = project.author_tipe || project.User?.tipe
        if (authorTipe === "dosen") {
          await assertDosenSlot(project.category_id, project.id)
        } else {
          await assertMahasiswaSlot(project.category_id, project.id)
        }
      }
      project.status = status ?? project.status
    }

    await project.save({ transaction: t })

    await persistRelations(project, relations, { transaction: t })
  })

  await cache.delPrefix("categories:list")

  // Admin mengubah karya milik user lain -> beri tahu pemilik.
  if (user.role === "admin" && project.user_id !== user.id) {
    await createNotification(
      {
        user_id: project.user_id,
        type: "project_updated",
        title: "Karyamu diperbarui admin",
        message: `Project "${project.title}" telah diubah oleh admin. Silakan cek kembali karyamu.`,
        reference_type: "project",
        reference_id: project.id,
      },
      { transaction: null },
    ).catch(() => {})
  }

  return await exports.getProjectById(project.id, user.id, user.role)
}

exports.deleteProject = async (id, user) => {
  const project = await exports.getProjectById(id, user.id, user.role)

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

  await cache.delPrefix("categories:list")

  // Admin menghapus karya milik user lain -> beri tahu pemilik.
  if (user.role === "admin" && project.user_id !== user.id) {
    await createNotification({
      user_id: project.user_id,
      type: "project_deleted",
      title: "Karyamu dihapus admin",
      message: `Project "${project.title}" telah dihapus oleh admin.`,
      reference_type: "project",
      reference_id: project.id,
    }).catch(() => {})
  }

  return project
}

exports.getMyProjects = async (userId) => {
  const [items, pending, published, rejected, total] = await Promise.all([
    Project.findAll({
      where: { user_id: userId },
      attributes: {
        include: PROJECT_COUNT_ATTRIBUTES,
      },
      include: [
        CATEGORY_INCLUDE,
        USER_INCLUDE,
        IMAGES_INCLUDE,
        TECHNOLOGIES_INCLUDE,
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
    items: items.map(toProjectJSON),
    counts: { pending, published, rejected, total },
  }
}

// ---- Data project untuk hall 3D: seluruh project published dengan semua
// relasi yang dipakai modal detail hall, dalam satu kali request. ----
exports.getHallProjects = async (currentUserId = null) => {
  const projects = await Project.findAll({
    where: { status: "published" },
    attributes: {
      include: PROJECT_COUNT_ATTRIBUTES,
    },
    include: [
      {
        ...CATEGORY_INCLUDE,
        required: true,
        where: { is_active: true },
      },
      USER_INCLUDE,
      IMAGES_INCLUDE,
      MEMBERS_INCLUDE,
      TECHNOLOGIES_INCLUDE,
      DOCUMENTS_INCLUDE,
      VIDEOS_INCLUDE,
      LINKS_INCLUDE,
    ],
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    distinct: true,
  })

  return applyUserFlags(projects.map(toProjectJSON), currentUserId)
}
