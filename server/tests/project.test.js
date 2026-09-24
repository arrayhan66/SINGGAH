const request = require("supertest")
const app = require("../server")
const { User, Category, Project } = require("../models")

describe("Project Endpoints", () => {
  let adminToken = ""
  let studentToken = ""
  let dosenToken = ""
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

    // Register & login Dosen
    await request(app).post("/api/auth/register").send({
      name: "Dosen",
      username: "dosenproj",
      email: "dosenproj@example.com",
      password: "Password123!",
      tipe: "dosen",
      nim_nip: "198001012010011001",
    })
    const dosenUser = await User.findOne({ where: { email: "dosenproj@example.com" } })
    dosenUser.is_verified = true
    dosenUser.tipe = "dosen"
    dosenUser.pending_tipe = null
    await dosenUser.save()
    const dosenLogin = await request(app).post("/api/auth/login").send({
      email: "dosenproj@example.com",
      password: "Password123!",
    })
    dosenToken = dosenLogin.body.data.token
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

  describe("Karya Unggulan per tipe penulis (mahasiswa & dosen)", () => {
    const createPublished = async (token, title) => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${token}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", title)
        .field("description", "Karya untuk uji slot unggulan")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
      return res.body.data.id
    }

    const setFeatured = async (id, slot) =>
      request(app)
        .patch(`/api/projects/${id}/featured`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slot })

    // students upload → pending, perlu di-publish admin. dosen upload → published.
    const publish = async (id) =>
      request(app)
        .patch(`/api/projects/${id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })

    let mhs1, mhs2, dos1
    beforeAll(async () => {
      mhs1 = await createPublished(studentToken, `UnaKaryaMhs1 ${Date.now()}`)
      mhs2 = await createPublished(studentToken, `UnaKaryaMhs2 ${Date.now()}`)
      dos1 = await createPublished(dosenToken, `UnaKaryaDosen1 ${Date.now()}`)
      for (const id of [mhs1, mhs2]) {
        await publish(id)
      }
      const res = await request(app).get(`/api/projects/${dos1}`)
      expect(res.status).toBe(200)
    })

    it("mahasiswa mengisi slot 1 dan slot 2 (2 unggulan mahasiswa)", async () => {
      const r1 = await setFeatured(mhs1, 1)
      expect(r1.status).toBe(200)
      const r2 = await setFeatured(mhs2, 2)
      expect(r2.status).toBe(200)
    })

    it("dosen tetap bisa mengisi slot 1 & 2 yang sama tanpa bentrok dengan slot mahasiswa", async () => {
      const r1 = await setFeatured(dos1, 1)
      expect(r1.status).toBe(200)
      const r2 = await setFeatured(dos1, 2)
      expect(r2.status).toBe(200)
    })

    it("dua karya mahasiswa TIDAK boleh menempati slot yang sama", async () => {
      const res = await setFeatured(mhs2, 1)
      expect(res.status).toBe(409)
    })

    it("memberantahkan karya unggulan yang terisi saat dipakai tes lain", async () => {
      await setFeatured(mhs1, null)
      await setFeatured(mhs2, null)
      await setFeatured(dos1, null)
    })
  })
})
