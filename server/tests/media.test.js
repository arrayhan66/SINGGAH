const fs = require("fs")
const path = require("path")
const request = require("supertest")
const app = require("../server")
const { User } = require("../models")
const { UPLOAD_ROOT } = require("../utils/localImage")

const MEDIA_DIR = path.join(UPLOAD_ROOT, "media")

describe("Media Endpoints", () => {
  let adminToken = ""
  let userToken = ""

  beforeAll(async () => {
    fs.rmSync(MEDIA_DIR, { recursive: true, force: true })
    fs.mkdirSync(MEDIA_DIR, { recursive: true })

    await User.destroy({ where: {} })

    await request(app).post("/api/auth/register").send({
      name: "Media Admin",
      username: "mediaadmin",
      email: "mediaadmin@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "mediaadmin@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "mediaadmin@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    await request(app).post("/api/auth/register").send({
      name: "Media User",
      username: "mediauser",
      email: "mediauser@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010003",
    })
    const user = await User.findOne({ where: { email: "mediauser@example.com" } })
    user.is_verified = true
    user.tipe = "mahasiswa"
    user.pending_tipe = null
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "mediauser@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token
  })

  afterAll(() => {
    fs.rmSync(MEDIA_DIR, { recursive: true, force: true })
  })

  describe("GET /api/media", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/media")

      expect(res.status).toBe(401)
    })

    it("should forbid non-admin", async () => {
      const res = await request(app)
        .get("/api/media")
        .set("Authorization", `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })

    it("should list media resources for admin", async () => {
      fs.writeFileSync(path.join(MEDIA_DIR, "banner-x.png"), "test-img")

      const res = await request(app)
        .get("/api/media")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThanOrEqual(1)
      const found = res.body.data.find((m) => m.name === "banner-x.png")
      expect(found).toBeTruthy()
      expect(found).toHaveProperty("publicId", "media/banner-x")
      expect(found).toHaveProperty("url")
      expect(found).toHaveProperty("format", "png")
    })
  })

  describe("POST /api/media", () => {
    it("should require authentication", async () => {
      const res = await request(app).post("/api/media")

      expect(res.status).toBe(401)
    })

    it("should forbid non-admin", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })

    it("should reject unsupported file type", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("files", Buffer.from("not an image"), {
          filename: "note.bin",
          contentType: "application/octet-stream",
        })

      expect(res.status).toBe(400)
    })

    it("should upload media as admin", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("files", Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
          filename: "test.png",
          contentType: "image/png",
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toHaveProperty("publicId", "media/test")
      expect(res.body.data[0]).toHaveProperty("url")
    })
  })

  describe("DELETE /api/media/:publicId", () => {
    it("should require authentication", async () => {
      const res = await request(app).delete("/api/media/test-image")

      expect(res.status).toBe(401)
    })

    it("should forbid non-admin", async () => {
      const res = await request(app)
        .delete("/api/media/test-image")
        .set("Authorization", `Bearer ${userToken}`)

      expect(res.status).toBe(403)
    })

    it("should return 404 when media not found", async () => {
      const res = await request(app)
        .delete("/api/media/media/does-not-exist")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(404)
    })

    it("should delete media as admin", async () => {
      const absPath = path.join(MEDIA_DIR, "delete-me.png")
      fs.writeFileSync(absPath, "x")

      const res = await request(app)
        .delete("/api/media/media/delete-me")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(fs.existsSync(absPath)).toBe(false)
    })
  })
})
