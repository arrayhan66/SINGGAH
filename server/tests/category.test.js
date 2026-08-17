const request = require("supertest")
const app = require("../server")
const { User, Category } = require("../models")

describe("Category Endpoints", () => {
  let adminToken = ""
  let userToken = ""
  let categoryId = null

  beforeAll(async () => {
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Register Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      username: "adminuser",
      email: "admin@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "admin@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register Regular User
    await request(app).post("/api/auth/register").send({
      name: "Student User",
      username: "studentuser",
      email: "student@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010001",
    })
    const studentUser = await User.findOne({ where: { email: "student@example.com" } })
    studentUser.is_verified = true
    studentUser.tipe = "mahasiswa"
    studentUser.pending_tipe = null
    await studentUser.save()

    const studentLogin = await request(app).post("/api/auth/login").send({
      email: "student@example.com",
      password: "Password123!",
    })
    userToken = studentLogin.body.data.token
  })

  it("should forbid non-admin from creating a category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Artificial Intelligence", slug: "ai", description: "AI projects" })

    expect(res.status).toBe(403)
  })

  it("should allow admin to create a category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Artificial Intelligence", slug: "artificial-intelligence", description: "AI projects" })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("id")
    categoryId = res.body.data.id
  })

  it("should get all categories publicly", async () => {
    const res = await request(app).get("/api/categories")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it("should allow admin to update a category", async () => {
    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "AI & Machine Learning" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("name", "AI & Machine Learning")
  })
})
