const request = require("supertest")
const app = require("../server")
const { User, News } = require("../models")
const { tokenFromCookie } = require("./helpers")

describe("News Endpoints", () => {
  let adminToken = ""
  let userToken = ""
  let newsId = null

  beforeAll(async () => {
    await News.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin News",
      username: "adminnews",
      email: "adminnews@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "adminnews@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "adminnews@example.com",
      password: "Password123!",
    })
    adminToken = tokenFromCookie(adminLogin)

    // Register & login Regular User
    await request(app).post("/api/auth/register").send({
      name: "User News",
      username: "usernews",
      email: "usernews@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010004",
    })
    const user = await User.findOne({ where: { email: "usernews@example.com" } })
    user.is_verified = true
    user.tipe = "mahasiswa"
    user.pending_tipe = null
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "usernews@example.com",
      password: "Password123!",
    })
    userToken = tokenFromCookie(userLogin)
  })

  it("should allow admin to create a news", async () => {
    const res = await request(app)
      .post("/api/news")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("headline_image", Buffer.from("fake-image-bytes"), "headline.jpg")
      .field("title", "Pameran Inovasi 2026")
      .field("slug", "pameran-inovasi-2026")
      .field("summary", "Pameran inovasi tahunan kampus")
      .field("tags", JSON.stringify(["pameran", "inovasi"]))
      .field("content", "Konten berita lengkap tentang pameran inovasi 2026.")
      .field("status", "published")

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("id")
    expect(res.body.data).toHaveProperty("slug", "pameran-inovasi-2026")
    newsId = res.body.data.id
  })

  it("should get list of news publicly", async () => {
    const res = await request(app).get("/api/news")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items.length).toBeGreaterThan(0)
  })

  it("should get news detail publicly", async () => {
    const res = await request(app).get(`/api/news/${newsId}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("title", "Pameran Inovasi 2026")
  })

  describe("GET /api/news/slug/:slug", () => {
    it("should get news by slug publicly", async () => {
      const res = await request(app).get("/api/news/slug/pameran-inovasi-2026")

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("slug", "pameran-inovasi-2026")
      expect(res.body.data).toHaveProperty("id", newsId)
    })

    it("should return 404 for an unknown slug", async () => {
      const res = await request(app).get("/api/news/slug/tidak-ada-slug-ini")

      expect(res.status).toBe(404)
      expect(res.body.message).toMatch(/tidak ditemukan/i)
    })

    it("should return the same news on repeated reads", async () => {
      const first = await request(app).get("/api/news/slug/pameran-inovasi-2026")
      const second = await request(app).get("/api/news/slug/pameran-inovasi-2026")

      expect(second.status).toBe(200)
      expect(second.body.data.id).toBe(first.body.data.id)
    })
  })

  it("should forbid non-admin from updating a news", async () => {
    const res = await request(app)
      .put(`/api/news/${newsId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Update Ilegal" })

    expect(res.status).toBe(403)
  })

  it("should allow admin to update a news", async () => {
    const res = await request(app)
      .put(`/api/news/${newsId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Pameran Inovasi 2026 (Update)" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("title", "Pameran Inovasi 2026 (Update)")
  })

  it("should allow admin to delete a news", async () => {
    const res = await request(app)
      .delete(`/api/news/${newsId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
