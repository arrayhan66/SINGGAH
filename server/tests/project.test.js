const request = require("supertest")
const app = require("../server")
const { User, Category, Project } = require("../models")

describe("Project Endpoints", () => {
  let adminToken = ""
  let studentToken = ""
  let categoryId = null
  let projectId = null

  beforeAll(async () => {
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Create Category
    const category = await Category.create({
      name: "Web Development",
      slug: "web-development",
      description: "Web apps",
    })
    categoryId = category.id

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin",
      username: "adminproj",
      email: "adminproj@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "adminproj@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "adminproj@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Student
    await request(app).post("/api/auth/register").send({
      name: "Student",
      username: "studentproj",
      email: "studentproj@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010002",
    })
    const studentUser = await User.findOne({ where: { email: "studentproj@example.com" } })
    studentUser.is_verified = true
    studentUser.tipe = "mahasiswa"
    studentUser.pending_tipe = null
    await studentUser.save()
    const studentLogin = await request(app).post("/api/auth/login").send({
      email: "studentproj@example.com",
      password: "Password123!",
    })
    studentToken = studentLogin.body.data.token
  })

  it("should allow student to create a project (status pending)", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${studentToken}`)
      .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
      .field("title", "Smart Campus Portal")
      .field("description", "A platform for campus innovation")
      .field("category_id", categoryId)
      .field("year", 2026)
      .field("abstract", "Abstract text here...")
      .field("technologies", JSON.stringify(["Node.js", "React"]))
      .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("id")
    expect(res.body.data).toHaveProperty("status", "pending")
    projectId = res.body.data.id
  })

  it("should get pending projects as admin", async () => {
    const res = await request(app)
      .get("/api/projects/pending")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
  })

  it("should allow admin to approve project status", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "published" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("status", "published")
  })

  it("should get published projects publicly", async () => {
    const res = await request(app).get("/api/projects")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items.length).toBeGreaterThan(0)
  })
})
