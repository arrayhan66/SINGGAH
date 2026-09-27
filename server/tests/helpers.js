const { User, Category, Project } = require("../models")
const { hashPassword } = require("../utils/hashPassword")
const generateToken = require("../utils/generateToken")

const PASSWORD = "Password123!"

// User dibuat langsung lewat model, bukan lewat POST /api/auth/register.
// Tiap file test punya instance limiter sendiri (register 5/jam, login
// 5/15 menit, semuanya per IP), jadi kalau register via HTTP, file test
// kedua akan kena 429 sebelum sempat menguji endpoint-nya.
async function createUser(overrides = {}) {
  return await User.create({
    name: overrides.name || "User Test",
    username: overrides.username,
    email: overrides.email,
    password: await hashPassword(overrides.password || PASSWORD),
    role: overrides.role || "user",
    tipe: overrides.tipe || "umum",
    nim_nip: overrides.nim_nip === undefined ? null : overrides.nim_nip,
    status: overrides.status || "active",
    is_verified: overrides.is_verified === undefined ? true : overrides.is_verified,
  })
}

const tokenFor = (user) => generateToken(user)

async function createCategory(overrides = {}) {
  return await Category.create({
    name: overrides.name || "Kategori Test",
    slug: overrides.slug || `kategori-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: overrides.description || "Deskripsi kategori test",
    is_active: overrides.is_active === undefined ? true : overrides.is_active,
  })
}

async function createProject(user, category, overrides = {}) {
  const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 7)}`
  return await Project.create({
    title: overrides.title || `Karya Test ${suffix}`,
    slug: overrides.slug || `karya-test-${suffix}`,
    thumbnail: overrides.thumbnail || `https://res.cloudinary.com/test/image/upload/v1/projects/${suffix}.jpg`,
    description: overrides.description || "Deskripsi karya test",
    year: overrides.year || 2026,
    status: overrides.status || "published",
    user_id: user.id,
    category_id: category.id,
    author_tipe: overrides.author_tipe || user.tipe,
    featured_slot: overrides.featured_slot === undefined ? null : overrides.featured_slot,
    is_shown_in_slideshow: overrides.is_shown_in_slideshow === undefined ? false : overrides.is_shown_in_slideshow,
  })
}

module.exports = {
  PASSWORD,
  createUser,
  tokenFor,
  createCategory,
  createProject,
}
