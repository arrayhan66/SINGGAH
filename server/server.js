require("dotenv").config({ quiet: true })
require("./config/env")

const path = require("path")
const fs = require("fs")
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")
const logger = require("./utils/logger")

const { sequelize } = require("./models")

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const errorMiddleware = require("./middlewares/errorMiddleware")
const categoryRoutes = require("./routes/categoryRoutes")
const projectRoutes = require("./routes/projectRoutes")
const newsRoutes = require("./routes/newsRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const commentRoutes = require("./routes/commentRoutes")
const bookmarkRoutes = require("./routes/bookmarkRoutes")
const projectImageRoutes = require("./routes/projectImageRoutes")
const projectVideoRoutes = require("./routes/projectVideoRoutes")
const projectDocumentRoutes = require("./routes/projectDocumentRoutes")
const projectLinkRoutes = require("./routes/projectLinkRoutes")
const projectLikeRoutes = require("./routes/projectLikeRoutes")
const projectMemberRoutes = require("./routes/projectMemberRoutes")
const projectViewRoutes = require("./routes/projectViewRoutes")
const publicStatsRoutes = require("./routes/publicStatsRoutes")
const settingRoutes = require("./routes/settingRoutes")
const activityLogRoutes = require("./routes/activityLogRoutes")
const mediaRoutes = require("./routes/mediaRoutes")
const reportRoutes = require("./routes/reportRoutes")
const hallRoutes = require("./routes/hallRoutes")
const maintenanceMiddleware = require("./middlewares/maintenanceMiddleware")
const { apiWriteLimiter } = require("./middlewares/rateLimiter")
const ensureGoogleIdColumn = require("./scripts/ensureGoogleIdColumn")
const ensureSlideshowColumn = require("./scripts/ensureSlideshowColumn")

const swaggerUi = require("swagger-ui-express")
const loadSwagger = require("./config/swagger")
const { isRedisReady } = require("./config/redis")

const app = express()
const PORT = process.env.PORT || 5000

// Catatan: di PM2 cluster mode, SETIAP worker tetap harus memanggil
// app.listen(). Pembagian koneksi dilakukan modul cluster Node (hanya worker
// pertama yang memegang socket, sisanya meneruskan). Yang tidak boleh dipakai
// adalah http.createServer(app) + server.listen(), karena membuat server di
// luar jalur cluster sehingga tiap worker merebut port dan gagal EADDRINUSE.

// Jumlah proxy tepercaya di depan Express. WAJIB benar, karena semua limit
// berbasis IP (rate limiter, log akses) membaca req.ip dari sini.
//
// Rantai di produksi:  browser -> Vercel (rewrite /api) -> nginx -> Node
//   jadi ada 2 proxy tepercaya sebelum Node, bukan 1.
// Kalau nilainya kurang, req.ip akan menjadi IP Vercel/nginx, sehingga SEMUA
// pengguna terlihat satu IP dan rate limiter bisa salah throttle semuanya.
// Kalau kelebihan, IP asli bisa dipalsukan client danumanng circumvent limit.
//
//   TRUST_PROXY=1  akses langsung (nginx -> Node, tanpa Vercel)
//   TRUST_PROXY=2  produksi lewat Vercel  <- nilai yang dipakai di VPS
const TRUST_PROXY = Number(process.env.TRUST_PROXY ?? 1)
app.set("trust proxy", TRUST_PROXY)

app.use(
  helmet({
    referrerPolicy: { policy: "same-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
)

const FRONTEND_URLS = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      // Izinkan request non-browser (curl, Postman, test) tanpa origin.
      if (!origin) return callback(null, true)
      callback(null, FRONTEND_URLS.includes(origin))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Response API (terutama /api/hall dan daftar berita) bisa berukuran
// ratusan KB sampai MB. Tanpa compression, seluruh payload itu keluar
// mentah lewat jaringan dan membaca event loop saat di-serialize.
app.use(
  compression({
    threshold: 1024,
  }),
)

app.use(express.json({ limit: "2mb" }))

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  )
}

app.use("/api", maintenanceMiddleware)

// Jaring pengaman untuk request yang mengubah data. Harus dipasang SEBELUM
// router, kalau tidak akan dilewati karena router yang menjawab lebih dulu.
//
// Hanya berlaku untuk method menulis; GET/HEAD/OPTIONS dilewati supaya list
// dan polling notifikasi tidak ikut dibatasi.
//
// Path di bawah sudah punya limiter sendiri yang lebih ketat, jadi DILEWATI.
// Kalau limiter global ikut menghitung request yang sama, express-rate-limit
// v8 melempar ERR_ERL_DOUBLE_COUNT dan limiter global diam-diam berhenti
// increment untuk request itu.
const ALREADY_LIMITED = [
  /^\/auth/, // 7 limiter auth
  /^\/projects\/[^/]+\/view\/?$/, // viewLimiter
  /^\/stats\/visit\/?$/, // visitLimiter
]

app.use("/api", (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next()
  }
  if (ALREADY_LIMITED.some((pattern) => pattern.test(req.path))) {
    return next()
  }
  return apiWriteLimiter(req, res, next)
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/news", newsRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/activity-logs", activityLogRoutes)
app.use("/api/media", mediaRoutes)
app.use("/api/reports", reportRoutes)

// Sub-routes project (dipasang sebelum projectRoutes agar "/my-bookmarks" tidak ketangkap ":id")
app.use("/api/projects", bookmarkRoutes)
app.use("/api/projects", commentRoutes)
app.use("/api/projects", projectLikeRoutes)
app.use("/api/projects", projectMemberRoutes)
app.use("/api/projects", projectVideoRoutes)
app.use("/api/projects", projectDocumentRoutes)
app.use("/api/projects", projectLinkRoutes)
app.use("/api/projects", projectViewRoutes)
app.use("/api/projects/:id/images", projectImageRoutes)
app.use("/api/projects", projectRoutes)

app.use("/api/stats", publicStatsRoutes)

app.use("/api/hall", hallRoutes)

// Production: sajikan build frontend dari Express agar frontend & API
// berada di asal (origin) yang sama. Media disajikan dari Cloudinary,
// jadi tidak perlu menyajikan folder /uploads lagi.
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist")
if (process.env.NODE_ENV === "production" && fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))
  // SPA fallback (react-router) tanpa mengganggu /api.
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next()
    }
    res.sendFile(path.join(CLIENT_DIST, "index.html"))
  })
}

app.get("/", (req, res) => {
  res.json({
    message: "SINGGAH API is running",
  })
})

const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info("Database connected")

    // Redis itu opsional secara fungsional (semua ada fallback ke memori),
    // tapi JAUH lebih lambat dan tidak konsisten antar worker PM2. Di cluster
    // mode, cache memori tiap worker terpisah sehingga cache hit rate anjlok
    // di ~1/jumlahWorker dan rate limiter jadi longgar N kali lipat.
    // Kalau Redis mati, pastikan itu terlihat di log, bukan diam-diam.
    if (process.env.REDIS_URL) {
      if (await isRedisReady()) {
        logger.info("Redis ready")
      } else {
        logger.warn(
          "Redis TIDAK bisa dihubungi meskipun REDIS_URL diset — memakai cache " +
            "memori per worker. Jangan jalankan >1 worker PM2 dalam kondisi ini: " +
            "rate limiter jadi longgar N kali dan cache tidak dibagi antar worker.",
        )
      }
    } else {
      logger.warn(
        "REDIS_URL belum diset — memakai cache memori per worker. " +
          "Single worker saja yang aman untuk rate limit.",
      )
    }

    // Buat tabel yang belum ada (tanpa mengubah tabel lama)
    if (process.env.NODE_ENV !== "test") {
      await ensureGoogleIdColumn()
      await ensureSlideshowColumn()
      await sequelize.sync()
    }

    const swaggerDocument = await loadSwagger()

    // Dokumentasi API hanya untuk non-production (hindari bocor skema endpoint).
    if (process.env.NODE_ENV !== "production") {
      app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    }

    // 404 Handler — taruh di sini, SETELAH semua route termasuk docs
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
      })
    })

    // HARUS PALING BAWAH
    app.use(errorMiddleware)

    if (process.env.NODE_ENV !== "test") {
      // Backlog default Node cuma 511. Saat 1000 orang membuka beranda di
      // detik yang sama, sisanya dapat ECONNREFUSED padahal server sehat
      // (terukur: 2.685 koneksi ditolak saat uji beranda x1.000).
      // Backlog HARUS lewat app.listen — kalau memakai
      // http.createServer(app).listen(), jalur cluster PM2 terlewat sehingga
      // tiap worker merebut port dan gagal EADDRINUSE.
      const backlog = parseInt(process.env.SERVER_BACKLOG, 10) || 8192

      app.listen(PORT, backlog, () => {
        logger.info(`Server running on port ${PORT} (backlog ${backlog})`)
      })
    }
  } catch (err) {
    logger.error("Server failed to start:", err)
  }
}

if (process.env.NODE_ENV !== "test") {
  if (require.main === module) {
    // Dijalankan langsung (node server.js / nodemon) -> mulai server.
    startServer()
  } else {
    // Mode serverless (misalnya Vercel): app diekspor TANPA listen.
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
      })
    })
    app.use(errorMiddleware)
  }
} else {
  // Saat test, skip loadSwagger (swagger-parser lambat) supaya startup
  // cepat & deterministik; docs API tidak dipakai di test.
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint tidak ditemukan",
    })
  })
  app.use(errorMiddleware)
}

module.exports = app
