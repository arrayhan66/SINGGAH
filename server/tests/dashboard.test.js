const request = require("supertest")
const app = require("../server")
const { User, Category, Project, News } = require("../models")

describe("Dashboard & Public Stats Endpoints", () => {
  let adminToken = ""
  let userToken = ""

  beforeAll(async () => {
    await News.destroy({ where: {} })
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin Dashboard",
      username: "admindashboard",
      email: "admindashboard@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "admindashboard@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admindashboard@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Regular User
    await request(app).post("/api/auth/register").send({
      name: "User Dashboard",
      username: "userdashboard",
      email: "userdashboard@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010002",
    })
    const user = await User.findOne({ where: { email: "userdashboard@example.com" } })
    user.is_verified = true
    user.tipe = "mahasiswa"
    user.pending_tipe = null
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "userdashboard@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token

    // Seed data for meaningful stats
    const category = await Category.create({
      name: "Data Science",
      slug: "data-science",
    })

    await Project.create({
      title: "Analisis Data",
      slug: "analisis-data",
      thumbnail: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      description: "Project analisis data",
      year: 2026,
      status: "published",
      user_id: adminUser.id,
      category_id: category.id,
    })

    await Project.create({
      title: "Project Pending",
      slug: "project-pending",
      thumbnail: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      description: "Project pending",
      year: 2026,
      status: "pending",
      user_id: user.id,
      category_id: category.id,
    })

    await News.create({
      title: "Berita Test",
      slug: "berita-test",
      headline_image: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      content: "Konten berita test",
      status: "published",
      author_id: adminUser.id,
    })
  })

  it("should forbid non-admin from accessing dashboard", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it("should require authentication for dashboard", async () => {
    const res = await request(app).get("/api/dashboard")

    expect(res.status).toBe(401)
  })

  it("should return dashboard stats for admin", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.stats).toHaveProperty("totalProject", 2)
    expect(res.body.data.stats).toHaveProperty("pendingProject", 1)
    expect(res.body.data.stats).toHaveProperty("publishedProject", 1)
    expect(res.body.data.stats).toHaveProperty("totalNews", 1)
    expect(res.body.data.stats).toHaveProperty("totalUser", 2)
    expect(Array.isArray(res.body.data.pendingProjects)).toBe(true)
  })

  it("should return public stats", async () => {
    const res = await request(app).get("/api/stats")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("totalProject", 1)
    expect(res.body.data).toHaveProperty("totalCategory", 1)
    expect(res.body.data).toHaveProperty("totalUser", 2)
  })
})
