const request = require("supertest")
const app = require("../server")
const { User, Category, Project, ProjectMember } = require("../models")

describe("Hall Endpoints", () => {
  let studentToken = ""
  let categoryId = null
  let inactiveCategoryId = null
  let publishedProjectId = null
  let pendingProjectId = null

  beforeAll(async () => {
    await ProjectMember.destroy({ where: {} })
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Categories: satu aktif (dengan field hall), satu non-aktif.
    const active = await Category.create({
      name: "Arsitektur",
      slug: "arsitektur",
      description: "Karya arsitektur",
      icon: "building",
      color: "#2563EB",
      sort_order: 1,
      is_active: true,
    })
    categoryId = active.id

    const inactive = await Category.create({
      name: "Sembunyikan",
      slug: "sembunyikan",
      description: "Tidak tampil di hall",
      is_active: false,
      sort_order: 0,
    })
    inactiveCategoryId = inactive.id

    // Register & login Student
    await request(app).post("/api/auth/register").send({
      name: "Student Hall",
      username: "studenthall",
      email: "studenthall@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010010",
    })
    const studentUser = await User.findOne({ where: { email: "studenthall@example.com" } })
    studentUser.is_verified = true
    studentUser.tipe = "mahasiswa"
    studentUser.pending_tipe = null
    await studentUser.save()
    const studentLogin = await request(app).post("/api/auth/login").send({
      email: "studenthall@example.com",
      password: "Password123!",
    })
    studentToken = studentLogin.body.data.token

    // Create two projects: published & pending
    const published = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${studentToken}`)
      .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
      .field("title", "Museum Digital")
      .field("description", "Karya untuk hall 3D")
      .field("category_id", categoryId)
      .field("year", 2026)
      .field("abstract", "Abstract text here...")
      .field("technologies", JSON.stringify(["Three.js", "React"]))
      .field("members", JSON.stringify([{ name: "John Doe", role: "Developer" }]))
    publishedProjectId = published.body.data.id
    await Project.update({ status: "published" }, { where: { id: publishedProjectId } })

    const pending = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${studentToken}`)
      .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
      .field("title", "Proyek Draf")
      .field("description", "Belum diterbitkan")
      .field("category_id", categoryId)
      .field("year", 2026)
      .field("abstract", "Abstract text here...")
      .field("technologies", JSON.stringify(["Node.js"]))
      .field("members", JSON.stringify([{ name: "Jane Doe", role: "Designer" }]))
    pendingProjectId = pending.body.data.id
  })

  it("should return active categories and published projects publicly", async () => {
    const res = await request(app).get("/api/hall")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("categories")
    expect(res.body.data).toHaveProperty("projects")
  })

  it("should only include active categories with hall fields, ordered by sort_order", async () => {
    const res = await request(app).get("/api/hall")
    const categories = res.body.data.categories

    expect(Array.isArray(categories)).toBe(true)
    expect(categories.map((c) => c.id)).not.toContain(inactiveCategoryId)
    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: categoryId,
          icon: "building",
          color: "#2563EB",
          sort_order: 1,
          is_active: true,
          projectCount: 1,
        }),
      ]),
    )
  })

  it("should only include published projects with category slug and relations", async () => {
    const res = await request(app).get("/api/hall")
    const projects = res.body.data.projects

    expect(Array.isArray(projects)).toBe(true)
    expect(projects.map((p) => p.id)).not.toContain(pendingProjectId)

    const museum = projects.find((p) => p.id === publishedProjectId)
    expect(museum).toBeDefined()
    expect(museum.status).toBe("published")
    expect(museum.category).toBe("arsitektur")
    expect(museum.Category).toHaveProperty("slug", "arsitektur")
    expect(museum.User).toHaveProperty("tipe")
    expect(museum.members.length).toBeGreaterThan(0)
    expect(museum.technologies.length).toBeGreaterThan(0)
    expect(museum.thumbnail).toBeTruthy()
  })
})
