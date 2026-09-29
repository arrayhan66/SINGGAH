const request = require("supertest")
const app = require("../server")
const { User, Category, Project, ProjectMember, ProjectTechnology } = require("../models")
const { tokenFromCookie } = require("./helpers")

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
    adminToken = tokenFromCookie(adminLogin)

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
    studentToken = tokenFromCookie(studentLogin)

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
    dosenToken = tokenFromCookie(dosenLogin)
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

  describe("Slideshow beranda", () => {
    let publishedId = null

    const setSlideshow = (id, visible, token = adminToken) =>
      request(app)
        .patch(`/api/projects/${id}/slideshow`)
        .set("Authorization", `Bearer ${token}`)
        .send({ visible })

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", `Karya Slideshow ${Date.now()}`)
        .field("description", "Karya untuk uji slideshow beranda")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
      publishedId = res.body.data.id

      await request(app)
        .patch(`/api/projects/${publishedId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })
    })

    it("should require authentication", async () => {
      const res = await request(app)
        .patch(`/api/projects/${publishedId}/slideshow`)
        .send({ visible: true })

      expect(res.status).toBe(401)
    })

    it("should forbid non-admin", async () => {
      const res = await setSlideshow(publishedId, true, studentToken)

      expect(res.status).toBe(403)
    })

    it("should return 404 for an unknown project", async () => {
      const res = await setSlideshow(999999, true)

      expect(res.status).toBe(404)
    })

    it("should refuse a project that is not published yet", async () => {
      const pending = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", `Karya Pending Slideshow ${Date.now()}`)
        .field("description", "Belum dipublikasikan")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))

      const res = await setSlideshow(pending.body.data.id, true)
      expect(res.status).toBe(400)
    })

    it("should refuse a project that is not marked as unggulan", async () => {
      const res = await setSlideshow(publishedId, true)

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Unggulan/i)
    })

    it("should show and hide the project in the slideshow", async () => {
      const featured = await request(app)
        .patch(`/api/projects/${publishedId}/featured`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slot: 1 })
      expect(featured.status).toBe(200)

      const show = await setSlideshow(publishedId, true)
      expect(show.status).toBe(200)
      expect(show.body.success).toBe(true)
      expect(show.body.data.is_shown_in_slideshow).toBe(true)

      const hide = await setSlideshow(publishedId, false)
      expect(hide.status).toBe(200)
      expect(hide.body.data.is_shown_in_slideshow).toBe(false)

      const row = await Project.findByPk(publishedId)
      expect(row.is_shown_in_slideshow).toBe(false)
    })

    it("should leave the project hidden when called again after the test", async () => {
      const res = await setSlideshow(publishedId, false)
      expect(res.status).toBe(200)
    })
  })

  describe("GET /api/projects/pending", () => {
    it("should require authentication", async () => {
      const res = await request(app).get("/api/projects/pending")
      expect(res.status).toBe(401)
    })

    it("should forbid non-admin", async () => {
      const res = await request(app)
        .get("/api/projects/pending")
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(403)
    })

    it("should return only pending projects to admin", async () => {
      const published = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${dosenToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", `Karya Dosen Publish Otomatis ${Date.now()}`)
        .field("description", "Karya dosen")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
      const publishedId = published.body.data.id

      const res = await request(app)
        .get("/api/projects/pending")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.every((p) => p.status === "pending")).toBe(true)
      expect(res.body.data.map((p) => p.id)).not.toContain(publishedId)
    })
  })

  describe("GET /api/projects (daftar publik)", () => {
    let publishedId = null
    let pendingId = null

    beforeAll(async () => {
      const mk = async (token, title, year) => {
        const res = await request(app)
          .post("/api/projects")
          .set("Authorization", `Bearer ${token}`)
          .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
          .field("title", title)
          .field("description", `Deskripsi ${title}`)
          .field("category_id", categoryId)
          .field("year", year)
          .field("abstract", "Abstract text here...")
          .field("technologies", JSON.stringify(["Node.js"]))
          .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
        return res.body.data.id
      }

      publishedId = await mk(studentToken, `Karya Publik ${Date.now()}`, 2024)
      pendingId = await mk(studentToken, `Karya Menunggu ${Date.now()}`, 2023)

      await request(app)
        .patch(`/api/projects/${publishedId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })
    })

    it("should only expose published projects to anonymous visitors", async () => {
      const res = await request(app).get("/api/projects")

      expect(res.status).toBe(200)
      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(publishedId)
      expect(ids).not.toContain(pendingId)
    })

    it("should return pagination metadata", async () => {
      const res = await request(app).get("/api/projects?page=1&limit=5")

      expect(res.status).toBe(200)
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      })
      expect(res.body.data.items.length).toBeLessThanOrEqual(5)
    })

    it("should clamp a limit beyond the public maximum", async () => {
      const res = await request(app).get("/api/projects?limit=100000")

      expect(res.status).toBe(200)
      expect(res.body.data.pagination.limit).toBe(100)
    })

    it("should normalise invalid pagination input", async () => {
      const res = await request(app).get("/api/projects?page=abc&limit=-5")

      expect(res.status).toBe(200)
      expect(res.body.data.pagination.page).toBe(1)
      expect(res.body.data.pagination.limit).toBeGreaterThanOrEqual(1)
    })

    it("should filter by year", async () => {
      const res = await request(app).get("/api/projects?year=2024")

      expect(res.status).toBe(200)
      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(publishedId)
      expect(ids).not.toContain(pendingId)
      expect(res.body.data.items.every((p) => p.year === 2024)).toBe(true)
    })

    it("should filter by category", async () => {
      const res = await request(app).get(`/api/projects?category_id=${categoryId}`)

      expect(res.status).toBe(200)
      expect(res.body.data.items.every((p) => p.category_id === categoryId)).toBe(true)
    })

    it("should filter by search term on the title", async () => {
      const res = await request(app).get("/api/projects?search=Karya%20Publik")

      expect(res.status).toBe(200)
      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(publishedId)
    })

    it("should return an empty list for a search term that matches nothing", async () => {
      const res = await request(app).get("/api/projects?search=tidak-ada-zeta-999")

      expect(res.status).toBe(200)
      expect(res.body.data.items).toHaveLength(0)
      expect(res.body.data.pagination.total).toBe(0)
    })

    it("should filter by slideshow flag", async () => {
      const empty = await request(app).get("/api/projects?slideshow=true")
      expect(empty.status).toBe(200)

      const ids = empty.body.data.items.map((p) => p.id)
      expect(ids).not.toContain(publishedId)

      await request(app)
        .patch(`/api/projects/${publishedId}/featured`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slot: 2 })
      const shown = await request(app)
        .patch(`/api/projects/${publishedId}/slideshow`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ visible: true })
      expect(shown.status).toBe(200)

      const filtered = await request(app).get("/api/projects?slideshow=true")
      expect(filtered.status).toBe(200)
      expect(filtered.body.data.items.map((p) => p.id)).toContain(publishedId)

      await request(app)
        .patch(`/api/projects/${publishedId}/slideshow`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ visible: false })
    })

    it("should hide pending projects from a regular logged-in user", async () => {
      const res = await request(app)
        .get("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(publishedId)
      expect(ids).not.toContain(pendingId)
    })

    it("should let an admin see pending projects by filtering status", async () => {
      const res = await request(app)
        .get("/api/projects?status=pending")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(pendingId)
      expect(ids).not.toContain(publishedId)
    })

    it("should give admin a bigger limit than a public visitor", async () => {
      const pub = await request(app).get("/api/projects?limit=9999")
      const adm = await request(app)
        .get("/api/projects?limit=9999")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(pub.body.data.pagination.limit).toBe(100)
      expect(adm.body.data.pagination.limit).toBe(500)
    })

    it("should return different pages for a paginated query", async () => {
      const first = await request(app).get("/api/projects?page=1&limit=1")
      const second = await request(app).get("/api/projects?page=2&limit=1")

      expect(first.status).toBe(200)
      expect(second.status).toBe(200)
      expect(first.body.data.items).toHaveLength(1)
      expect(second.body.data.items).toHaveLength(1)
      expect(first.body.data.items[0].id).not.toBe(second.body.data.items[0].id)
    })
  })

  describe("GET /api/projects/my", () => {
    let mineId = null

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", `Karya Milik Saya ${Date.now()}`)
        .field("description", "Karya untuk uji daftar karya saya")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))

      mineId = res.body.data.id
    })

    it("should require authentication", async () => {
      const res = await request(app).get("/api/projects/my")
      expect(res.status).toBe(401)
    })

    it("should return only the caller's own projects with counts", async () => {
      const res = await request(app)
        .get("/api/projects/my")
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.items)).toBe(true)
      expect(res.body.data.counts).toEqual({
        pending: expect.any(Number),
        published: expect.any(Number),
        rejected: expect.any(Number),
        total: expect.any(Number),
      })

      const ids = res.body.data.items.map((p) => p.id)
      expect(ids).toContain(mineId)
      expect(res.body.data.counts.total).toBe(res.body.data.items.length)
    })

    it("should not leak another user's projects", async () => {
      const mine = await request(app)
        .get("/api/projects/my")
        .set("Authorization", `Bearer ${studentToken}`)
      const dosen = await request(app)
        .get("/api/projects/my")
        .set("Authorization", `Bearer ${dosenToken}`)

      const mineIds = mine.body.data.items.map((p) => p.id)
      const dosenIds = dosen.body.data.items.map((p) => p.id)

      expect(mineIds.some((id) => dosenIds.includes(id))).toBe(false)
    })
  })

  describe("PUT /api/projects/:id", () => {
    let targetId = null

    const createForStudent = async (title) => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", title)
        .field("description", "Deskripsi sebelum diedit")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
      return res.body.data.id
    }

    beforeAll(async () => {
      targetId = await createForStudent(`Karya Untuk Diedit ${Date.now()}`)
    })

    it("should require authentication", async () => {
      const res = await request(app)
        .put(`/api/projects/${targetId}`)
        .field("title", "Tanpa Auth")

      expect(res.status).toBe(401)
    })

    it("should hide an unpublished project from a non-owner with 404", async () => {
      const res = await request(app)
        .put(`/api/projects/${targetId}`)
        .set("Authorization", `Bearer ${dosenToken}`)
        .field("title", "Gagur")

      expect(res.status).toBe(404)
      const row = await Project.findByPk(targetId)
      expect(row.title).not.toBe("Gagur")
    })

    it("should forbid editing a published project owned by someone else", async () => {
      const id = await createForStudent(`Karya Published Milik Orang Lain ${Date.now()}`)
      const published = await request(app)
        .patch(`/api/projects/${id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })
      expect(published.status).toBe(200)

      const res = await request(app)
        .put(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${dosenToken}`)
        .field("title", "Gagur")

      expect(res.status).toBe(403)
      const row = await Project.findByPk(id)
      expect(row.title).not.toBe("Gagur")
    })

    it("should reject an empty title", async () => {
      const res = await request(app)
        .put(`/api/projects/${targetId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .field("title", "   ")

      expect(res.status).toBe(400)
    })

    it("should reject an invalid year", async () => {
      const res = await request(app)
        .put(`/api/projects/${targetId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .field("year", "bukan-tahun")

      expect(res.status).toBe(400)
    })

    it("should apply a student edit directly to a published project", async () => {
      await request(app)
        .patch(`/api/projects/${targetId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })

      const res = await request(app)
        .put(`/api/projects/${targetId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .field("title", "Karya Sudah Diedit")
        .field("description", "Deskripsi setelah diedit")
        .field("year", 2025)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("title", "Karya Sudah Diedit")

      const row = await Project.findByPk(targetId)
      expect(row.title).toBe("Karya Sudah Diedit")
      expect(row.status).toBe("published")
    })

    it("should let an admin update any project", async () => {
      const otherId = await createForStudent(`Karya Milik Orang Lain ${Date.now()}`)

      const res = await request(app)
        .put(`/api/projects/${otherId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("title", "Disunting Admin")

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty("title", "Disunting Admin")
    })

    it("should return 404 for an unknown project", async () => {
      const res = await request(app)
        .put("/api/projects/999999")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("title", "Hantu")

      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /api/projects/:id", () => {
    const createForStudent = async (title) => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", title)
        .field("description", "Karya untuk uji hapus")
        .field("category_id", categoryId)
        .field("year", 2026)
        .field("abstract", "Abstract text here...")
        .field("technologies", JSON.stringify(["Node.js"]))
        .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
      return res.body.data.id
    }

    it("should require authentication", async () => {
      const id = await createForStudent(`Karya Hapus Tanpa Auth ${Date.now()}`)

      const res = await request(app).delete(`/api/projects/${id}`)

      expect(res.status).toBe(401)
      expect(await Project.findByPk(id)).not.toBeNull()
    })

    it("should forbid deleting a published project owned by someone else", async () => {
      const id = await createForStudent(`Karya Published Milik Orang Lain ${Date.now()}`)
      const published = await request(app)
        .patch(`/api/projects/${id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "published" })
      expect(published.status).toBe(200)

      const res = await request(app)
        .delete(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${dosenToken}`)

      expect(res.status).toBe(403)
      expect(await Project.findByPk(id)).not.toBeNull()
    })

    it("should return 404 for an unknown project", async () => {
      const res = await request(app)
        .delete("/api/projects/999999")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete their project and its child rows", async () => {
      const id = await createForStudent(`Karya Dihapus Pemilik ${Date.now()}`)

      const res = await request(app)
        .delete(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await Project.findByPk(id)).toBeNull()
      expect(await ProjectMember.count({ where: { project_id: id } })).toBe(0)
      expect(await ProjectTechnology.count({ where: { project_id: id } })).toBe(0)
    })

    it("should let an admin delete any project", async () => {
      const id = await createForStudent(`Karya Dihapus Admin ${Date.now()}`)

      const res = await request(app)
        .delete(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(await Project.findByPk(id)).toBeNull()
    })
  })

  describe("Status karya mahasiswa vs dosen", () => {
    it("should publish a dosen upload immediately", async () => {
      const res = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${dosenToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", "Karya Dosen Langsung Tayang")
        .field("description", "Tanpa perlu ditinjau admin")
        .field("category_id", categoryId)
        .field("year", 2026)

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty("status", "published")
    })

    it("should move a rejected mahasiswa project back to pending on resubmit", async () => {
      const created = await request(app)
        .post("/api/projects")
        .set("Authorization", `Bearer ${studentToken}`)
        .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
        .field("title", "Karya Untuk Diajukan Ulang")
        .field("description", "Deskripsi awal")
        .field("category_id", categoryId)
        .field("year", 2026)

      const id = created.body.data.id
      expect(created.body.data).toHaveProperty("status", "pending")

      const rejected = await request(app)
        .patch(`/api/projects/${id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "rejected", reason: "Deskripsi kurang lengkap" })

      expect(rejected.status).toBe(200)
      expect((await Project.findByPk(id)).status).toBe("rejected")

      const resubmit = await request(app)
        .put(`/api/projects/${id}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .field("title", "Karya Diajukan Ulang")
        .field("description", "Deskripsi sudah dilengkapi")
        .field("year", 2026)

      expect(resubmit.status).toBe(200)
      expect(resubmit.body.data).toHaveProperty("status", "pending")

      const row = await Project.findByPk(id)
      expect(row.title).toBe("Karya Diajukan Ulang")
      expect(row.status).toBe("pending")
      expect(row.rejection_reason).toBeNull()
    })

    it("should no longer expose the revision endpoints", async () => {
      const res = await request(app)
        .get("/api/projects/revisions")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(404)
    })
  })
})
