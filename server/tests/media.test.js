jest.mock("../config/cloudinary", () => ({
  search: {
    expression: jest.fn(),
    sort_by: jest.fn(),
    max_results: jest.fn(),
    execute: jest.fn(),
  },
  uploader: {
    destroy: jest.fn(),
  },
}))

const request = require("supertest")
const app = require("../server")
const { User } = require("../models")
const cloudinary = require("../config/cloudinary")

describe("Media Endpoints", () => {
  let adminToken = ""
  let userToken = ""

  beforeAll(async () => {
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
    })
    const user = await User.findOne({ where: { email: "mediauser@example.com" } })
    user.is_verified = true
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "mediauser@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token
  })

  beforeEach(() => {
    cloudinary.search.expression.mockReturnValue(cloudinary.search)
    cloudinary.search.sort_by.mockReturnValue(cloudinary.search)
    cloudinary.search.max_results.mockReturnValue(cloudinary.search)
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
      cloudinary.search.execute.mockResolvedValueOnce({
        resources: [
          {
            public_id: "pamerit/media/banner-1",
            secure_url: "https://res.cloudinary.com/test/image/upload/banner-1.png",
            filename: "banner-1.png",
            format: "png",
            resource_type: "image",
            bytes: 1024,
            created_at: "2026-01-01T00:00:00Z",
            width: 1920,
            height: 1080,
          },
        ],
      })

      const res = await request(app)
        .get("/api/media")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toHaveProperty("publicId", "pamerit/media/banner-1")
      expect(res.body.data[0]).toHaveProperty("url")
      expect(res.body.data[0]).toHaveProperty("format", "png")
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

    it("should reject non-image file", async () => {
      const res = await request(app)
        .post("/api/media")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("files", Buffer.from("not an image"), {
          filename: "note.txt",
          contentType: "text/plain",
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
      expect(res.body.data[0]).toHaveProperty("publicId", "test/test")
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
      cloudinary.uploader.destroy.mockResolvedValueOnce({ result: "not found" })

      const res = await request(app)
        .delete("/api/media/does-not-exist")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(404)
    })

    it("should delete media as admin", async () => {
      cloudinary.uploader.destroy.mockResolvedValueOnce({ result: "ok" })

      const res = await request(app)
        .delete("/api/media/test-image")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
