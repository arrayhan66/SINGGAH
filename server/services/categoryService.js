const { Category, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const cache = require("../utils/cache")
const singleFlight = require("../utils/singleFlight")
const cacheEpoch = require("../utils/cacheEpoch")

const CATEGORIES_TTL = 60 * 1000
const CATEGORIES_KEY = "categories:list"
const CATEGORIES_ALL_KEY = `${CATEGORIES_KEY}:all`
const CATEGORIES_ACTIVE_KEY = `${CATEGORIES_KEY}:active`

// Batas kategori yang boleh tampil di hall 3D sekaligus. Kategori nonaktif
// tidak dihitung, jadi admin bisa menonaktifkan/menghapus satu untuk
// membuka slot baru.
const MAX_ACTIVE_CATEGORIES = 10

const limitError = `Jumlah kategori aktif telah mencapai batas maksimal ${MAX_ACTIVE_CATEGORIES}. Nonaktifkan atau hapus kategori lain terlebih dahulu.`

// Isi hall (hall:projects) ikut memfilter kategori aktif, jadi setiap perubahan
// kategori harus membongkar juga cache karya. Require di dalam fungsi supaya
// tidak terbentuk siklus import modul.
const purgeProjectCaches = () =>
  require("./projectService").invalidateProjectListCaches()

// Semua jalur perubahan kategori lewat sini: naikkan epoch dulu (agar query
// yang sedang berjalan tidak menulis data basi balik ke cache), lalu bersihkan
// cache kategori dan cache karya.
const invalidateCategoryCaches = async () => {
  cacheEpoch.bump()
  await cache.delPrefix(CATEGORIES_KEY)
  await purgeProjectCaches()
}

// Body JSON idealnya boolean, tapi validator menerima string "true"/"false".
// Sequelize akan menyimpan string "false" sebagai TRUE untuk kolom BOOLEAN,
// jadi normalkan lebih dulu supaya toggle tidak terlihat "membalik".
const toBool = (value) =>
  value === true || value === 1 || value === "1" || value === "true"

// Hitung karya per kategori. Default hanya karya published (dipakai halaman
// publik/Hall). Saat allStatuses=true, menghitung semua status — dipakai halaman
// admin Kelola Kategori agar sinkron dengan jumlah di Kelola Karya.
exports.getCategories = async ({ allStatuses = false } = {}) => {
  const cacheKey = allStatuses ? CATEGORIES_ALL_KEY : CATEGORIES_KEY

  const cached = await cache.get(cacheKey)
  if (cached) return cached

  const countExpr = allStatuses
    ? "(SELECT COUNT(*) FROM projects WHERE projects.category_id = Category.id)"
    : "(SELECT COUNT(*) FROM projects WHERE projects.category_id = Category.id AND projects.status = 'published')"

  const epochAtStart = cacheEpoch.current()
  const categories = await Category.findAll({
    attributes: {
      include: [[sequelize.literal(countExpr), "projectCount"]],
    },
    order: [
      ["sort_order", "ASC"],
      ["name", "ASC"],
    ],
  })

  // Kalau ada kategori yang berubah selama query berjalan, hasil ini basi
  // (is_active lama) — jangan ditulis, biarkan request berikutnya membangun.
  if (cacheEpoch.current() === epochAtStart) {
    await cache.set(cacheKey, categories, CATEGORIES_TTL)
  }

  return categories
}

// Kategori yang aktif & urut sesuai hall 3D (hanya yang ditampilkan di hall).
//
// Query-nya sama dengan getCategories tapi dibatasi is_active, jadi tidak bisa
// memakai cache yang sama. Tanpa cache, setiap permintaan /api/hall ikut
// menanyakan ini ke database; dengan satu request hall tanpa cache, load test
// menunjukkan query ini tetap jalan walau data karya sudah di-cache.
exports.getActiveCategories = async () => {
  const cached = await cache.get(CATEGORIES_ACTIVE_KEY)
  if (cached) return cached

  return singleFlight(CATEGORIES_ACTIVE_KEY, async () => {
    // Seseorang mungkin sudah mengisi cache selagi kita menunggu mutex.
    const afterWait = await cache.get(CATEGORIES_ACTIVE_KEY)
    if (afterWait) return afterWait

    const epochAtStart = cacheEpoch.current()
    const categories = await Category.findAll({
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

    if (cacheEpoch.current() === epochAtStart) {
      await cache.set(CATEGORIES_ACTIVE_KEY, categories, CATEGORIES_TTL)
    }

    return categories
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

  // Kategori baru default aktif; tolak jika hall sudah penuh (10 aktif).
  const willBeActive = is_active === undefined ? true : toBool(is_active)
  if (willBeActive) {
    const activeCount = await Category.count({ where: { is_active: true } })
    if (activeCount >= MAX_ACTIVE_CATEGORIES) {
      throw new AppError(limitError, 400)
    }
  }

  const nameExists = await Category.findOne({
    where: { name },
  })

  if (nameExists) {
    return nameExists
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
    is_active: willBeActive,
  })

  await invalidateCategoryCaches()

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

  // Mengaktifkan kategori nonaktif juga memakai slot hall — tolak kalau penuh.
  const becomesActive =
    is_active !== undefined && toBool(is_active) && !category.is_active
  if (becomesActive) {
    const activeCount = await Category.count({ where: { is_active: true } })
    if (activeCount >= MAX_ACTIVE_CATEGORIES) {
      throw new AppError(limitError, 400)
    }
  }

  category.name = name ?? category.name
  category.slug = slug ?? category.slug
  category.description = description ?? category.description
  category.icon = icon ?? category.icon
  category.color = color ?? category.color
  category.sort_order = sort_order ?? category.sort_order
  category.is_active =
    is_active === undefined ? category.is_active : toBool(is_active)

  await category.save()

  await invalidateCategoryCaches()

  return category
}

exports.deleteCategory = async (id) => {
  const category = await Category.findByPk(id)

  if (!category) {
    throw new AppError("Kategori tidak ditemukan", 404)
  }

  try {
    await category.destroy()
    await invalidateCategoryCaches()
  } catch (error) {
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw new AppError("Kategori masih digunakan oleh project", 400)
    }

    throw error
  }
}
