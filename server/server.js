require("dotenv").config()
require("./config/env")

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
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

const swaggerUi = require("swagger-ui-express")
const loadSwagger = require("./config/swagger")

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))

if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  )
}

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

app.get("/", (req, res) => {
  res.json({
    message: "SINGGAH API is running",
  })
})

const startServer = async () => {
  try {
    await sequelize.authenticate()
    logger.info("Database connected")

    // Buat tabel yang belum ada (tanpa mengubah tabel lama)
    if (process.env.NODE_ENV !== "test") {
      await sequelize.sync()
    }

    const swaggerDocument = await loadSwagger()
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`)
      })
    }
  } catch (err) {
    logger.error("Server failed to start:", err)
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer()
} else {
  loadSwagger().then((swaggerDocument) => {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
      })
    })
    app.use(errorMiddleware)
  })
}

module.exports = app
