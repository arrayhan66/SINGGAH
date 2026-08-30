require("dotenv").config()
require("../config/env")

const bcrypt = require("bcryptjs")
const { sequelize, User, Category, Project, News } = require("../models")

// Kredensial untuk E2E di CI. Default menyesuaikan .env.test client,
// namun di GitHub Actions akan di-pass via env sehingga seed selalu sinkron.
const CREDS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || "playeradmin@example.com",
    password: process.env.TEST_ADMIN_PASSWORD || "Password123!",
    name: process.env.TEST_ADMIN_NAME || "Admin CI",
    username: process.env.TEST_ADMIN_NAME
      ? (process.env.TEST_ADMIN_NAME || "Admin CI").toLowerCase().replace(/\s+/g, "_")
      : "admin_ci",
    tipe: "admin",
    role: "admin",
  },
  user: {
    email: process.env.TEST_USER_EMAIL || "mahasiswa@example.com",
    password: process.env.TEST_USER_PASSWORD || "Password123!",
    name: process.env.TEST_USER_NAME || "Mahasiswa CI",
    username: process.env.TEST_USER_NAME
      ? (process.env.TEST_USER_NAME || "Mahasiswa CI").toLowerCase().replace(/\s+/g, "_")
      : "mahasiswa_ci",
    tipe: "mahasiswa",
    role: "user",
  },
  dosen: {
    email: process.env.TEST_DOSEN_EMAIL || "dosen@example.com",
    password: process.env.TEST_DOSEN_PASSWORD || "Password123!",
    name: process.env.TEST_DOSEN_NAME || "Dosen CI",
    username: process.env.TEST_DOSEN_NAME
      ? (process.env.TEST_DOSEN_NAME || "Dosen CI").toLowerCase().replace(/\s+/g, "_")
      : "dosen_ci",
    tipe: "dosen",
    role: "user",
  },
  public: {
    email: process.env.TEST_PUBLIC_EMAIL || "umum@example.com",
    password: process.env.TEST_PUBLIC_PASSWORD || "Password123!",
    name: process.env.TEST_PUBLIC_NAME || "Umum CI",
    username: process.env.TEST_PUBLIC_NAME
      ? (process.env.TEST_PUBLIC_NAME || "Umum CI").toLowerCase().replace(/\s+/g, "_")
      : "umum_ci",
    tipe: "umum",
    role: "user",
  },
}

const PROJECT_SLUG = process.env.TEST_PROJECT_SLUG || "singgah-sistem-informasi"
const NEWS_SLUG = process.env.TEST_BERITA_SLUG || "ci-berita-unggulan"

const CATEGORIES = [
  {
    slug: "website",
    name: "Website",
    description: "Aplikasi web modern.",
    icon: "globe",
    color: "#3b82f6",
    sort_order: 1,
    is_active: true,
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    description: "Aplikasi Android dan iOS.",
    icon: "smartphone",
    color: "#a78bfa",
    sort_order: 2,
    is_active: true,
  },
  {
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description: "Machine Learning, Computer Vision.",
    icon: "brain",
    color: "#ec4899",
    sort_order: 3,
    is_active: true,
  },
]

const PROJECTS = [
  {
    slug: PROJECT_SLUG,
    title: "Sistem Informasi SINGGAH",
    description: "Proyek publikasi karya mahasiswa dan dosen Poliban dalam satu platform.",
    year: 2026,
    status: "published",
    featured_slot: 1,
  },
  {
    slug: "website-ekatalog-mobile-apps",
    title: "Ekatalog Karya Mobile",
    description: "Katalog karya mobile app interaktif untuk pameran digital.",
    year: 2026,
    status: "published",
    featured_slot: null,
  },
  {
    slug: "ai-deteksi-sampah",
    title: "AI Deteksi Sampah",
    description: "Model machine learning untuk klasifikasi sampah organik dan anorganik.",
    year: 2026,
    status: "published",
    featured_slot: null,
  },
  {
    slug: "website-portfolio-interaktif",
    title: "Portfolio Interaktif 3D",
    description: "Portfolio berbasis three.js dengan pengalaman 3D imersif.",
    year: 2026,
    status: "published",
    featured_slot: 2,
  },
]

async function seed() {
  try {
    await sequelize.authenticate()
    console.log("DB connected, syncing schema (alter)...")
    await sequelize.sync({ alter: true })

    const users = {}
    for (const [key, def] of Object.entries(CREDS)) {
      const hashed = await bcrypt.hash(def.password, 10)
      const [user] = await User.findOrCreate({
        where: { email: def.email },
        defaults: {
          name: def.name,
          username: def.username,
          password: hashed,
          tipe: def.tipe,
          role: def.role,
          is_verified: true,
          status: "active",
        },
      })
      const changed =
        user.password !== hashed ||
        user.name !== def.name ||
        user.username !== def.username ||
        user.tipe !== def.tipe ||
        user.role !== def.role ||
        !user.is_verified ||
        user.status !== "active"

      if (changed) {
        await user.update({
          name: def.name,
          username: def.username,
          password: hashed,
          tipe: def.tipe,
          role: def.role,
          is_verified: true,
          status: "active",
        })
      }
      users[key] = user
      console.log(`User ${key}: ${def.email}`)
    }

    const cats = {}
    for (const data of CATEGORIES) {
      const [cat] = await Category.findOrCreate({ where: { slug: data.slug }, defaults: data })
      if (cat.is_active !== data.is_active || cat.color !== data.color) {
        await cat.update({ is_active: data.is_active, color: data.color, name: data.name, sort_order: data.sort_order })
      }
      cats[data.slug] = cat
    }

    for (const data of PROJECTS) {
      const categorySlug = data.slug.startsWith("ai-")
        ? "artificial-intelligence"
        : "website"

      const [proj] = await Project.findOrCreate({
        where: { slug: data.slug },
        defaults: {
          ...data,
          thumbnail: `https://placehold.co/800x500/0f172a/38bdf8?text=${encodeURIComponent(data.title)}`,
          user_id: data.featured_slot === null && data.slug.includes("portfolio") ? users.dosen.id : users.user.id,
          category_id: cats[categorySlug].id,
        },
      })
      if (proj.status !== "published" || proj.featured_slot !== data.featured_slot) {
        await proj.update({
          status: "published",
          featured_slot: data.featured_slot,
          category_id: cats[categorySlug].id,
          thumbnail: proj.thumbnail || `https://placehold.co/800x500/0f172a/38bdf8?text=CI`,
        })
      }
    }

    const NEWS_CONTENT =
      "Ini konten berita unggulan untuk pengujian end-to-end di CI. Memuat gambar dengan caption (figure)."
    const NEWS_CONTENT_HTML =
      '<p>Ini konten berita unggulan untuk pengujian end-to-end di CI.</p><img src="https://placehold.co/800x450/0f172a/38bdf8?text=Gambar" alt="Gambar karya" data-caption="Gambar berkapitasi untuk uji regresi" />'

    const [news] = await News.findOrCreate({
      where: { slug: NEWS_SLUG },
      defaults: {
        title: "Berita Unggulan CI",
        headline_image: "https://placehold.co/1200x630/0f172a/38bdf8?text=CI",
        content: NEWS_CONTENT,
        contentHTML: NEWS_CONTENT_HTML,
        status: "published",
        published_at: new Date(),
        winner: null,
        date: null,
        source: null,
        summary: "Berita unggulan CI untuk pengujian e2e.",
        tags: null,
        gallery: null,
      },
    })
    if (
      news.status !== "published" ||
      news.contentHTML !== NEWS_CONTENT_HTML
    ) {
      await news.update({
        title: "Berita Unggulan CI",
        content: NEWS_CONTENT,
        contentHTML: NEWS_CONTENT_HTML,
        status: "published",
        published_at: new Date(),
        summary: "Berita unggulan CI untuk pengujian e2e.",
      })
    }
    console.log("News seeded:", NEWS_SLUG)

    console.log("Seed CI selesai.")
    process.exit(0)
  } catch (err) {
    console.error("Seed CI gagal:", err)
    if (err.original) console.error(err.original.message)
    process.exit(1)
  }
}

seed()