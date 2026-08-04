const request = require("supertest")
const app = require("../server")
const { User, Category, Project, ProjectLike, ProjectView } = require("../models")

describe("Reports & Activity Logs Endpoints", () => {
  let adminToken = ""
  let userToken = ""

  beforeAll(async () => {
    await ProjectView.destroy({ where: {} })
    await ProjectLike.destroy({ where: {} })
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin Reports",
      username: "adminreports",
      email: "adminreports@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "adminreports@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "adminreports@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Regular User
    await request(app).post("/api/auth/register").send({
      name: "User Reports",
      username: "userreports",
      email: "userreports@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })
    const user = await User.findOne({ where: { email: "userreports@example.com" } })
    user.is_verified = true
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "userreports@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token

    // Seed data for reports
    const category = await Category.create({
      name: "Cyber Security",
      slug: "cyber-security",
    })

    const project = await Project.create({
      title: "Sistem Keamanan",
      slug: "sistem-keamanan",
      thumbnail: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      description: "Project keamanan jaringan",
      year: 2026,
      status: "published",
      user_id: user.id,
      category_id: category.id,
    })

    await ProjectLike.create({ project_id: project.id, user_id: adminUser.id })
    await ProjectView.create({ project_id: project.id, user_id: user.id })
  })

  it("should forbid non-admin from accessing reports", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it("should require authentication for reports", async () => {
    const res = await request(app).get("/api/reports")

    expect(res.status).toBe(401)
  })

  it("should return admin reports", async () => {
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("year")
    expect(Array.isArray(res.body.data.monthly)).toBe(true)
    expect(res.body.data.monthly).toHaveLength(12)
    expect(res.body.data.stats).toHaveProperty("totalProject", 1)
    expect(res.body.data.stats).toHaveProperty("totalUser", 2)
    expect(res.body.data.stats).toHaveProperty("totalLikes", 1)
    expect(res.body.data.stats).toHaveProperty("totalVisitors", 1)
  })

  it("should forbid non-admin from accessing activity logs", async () => {
    const res = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it("should return activity logs for admin", async () => {
    const res = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.items)).toBe(true)
  })
})
