require("dotenv").config()
require("./config/env")

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")

const { sequelize } = require("./models")

const authRoutes = require("./routes/authRoutes")
const testRoutes = require("./routes/testRoutes")
const userRoutes = require("./routes/userRoutes")
const errorMiddleware = require("./middlewares/errorMiddleware")
const categoryRoutes = require("./routes/categoryRoutes")
const projectRoutes = require("./routes/projectRoutes")
const newsRoutes = require("./routes/newsRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

const swaggerUi = require("swagger-ui-express")
const loadSwagger = require("./config/swagger")

const app = express()
const PORT = process.env.PORT || 5000

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi 15 menit lagi.",
  },
})

app.use(helmet())

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))

app.use("/api/auth/login", authLimiter)
app.use("/api/auth/forgot-password", authLimiter)

app.use("/api/test", testRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/news", newsRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/notifications", notificationRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "SINGGAH API is running",
  })
})

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connected")

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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error("Server failed to start:", err)
  }
}

startServer()

module.exports = app
