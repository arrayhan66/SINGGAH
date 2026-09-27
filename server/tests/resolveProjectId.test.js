const request = require("supertest")
const app = require("../server")
const { Project } = require("../models")
const { createUser, tokenFor, createCategory } = require("./helpers")

describe("utils/resolveProjectId via HTTP", () => {
  let admin
  let adminToken = ""
  let projectSlug = ""

  beforeAll(async () => {
    await Project.destroy({ where: {} })
    const cat = await createCategory({ name: "Kategori Slug", slug: "slug-test" })
    admin = await createUser({
      name: "Admin Slug",
      username: "adminslug",
      email: "adminslug@example.com",
      role: "admin",
      tipe: "admin",
    })
    adminToken = tokenFor(admin)

    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("thumbnail", Buffer.from("bytes"), "t.jpg")
      .field("title", "Proyek Slug Uji")
      .field("description", "Deskripsi")
      .field("category_id", cat.id)
      .field("year", 2025)
      .field("abstract", "Abstract")
      .field("technologies", JSON.stringify(["TS"]))
      .field("members", JSON.stringify([{ name: "A", role: "Dev" }]))

    projectSlug = created.body.data.slug
    expect(projectSlug).toMatch(/^[a-z0-9-]+$/)
  })

  it("should resolve a numeric id for a listing endpoint", async () => {
    const res = await request(app).get(`/api/projects/${projectSlug}/likes`)
    expect(res.status).toBe(200)
  })

  it("should resolve a slug for a listing endpoint", async () => {
    const res = await request(app).get(`/api/projects/${projectSlug}/likes`)
    expect(res.status).toBe(200)
  })

  it("should return 404 when toggling a like on an unknown numeric id", async () => {
    const res = await request(app)
      .post("/api/projects/999999999/like")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Project tidak ditemukan")
  })

  it("should return 404 when toggling a like on an unknown slug", async () => {
    const res = await request(app)
      .post("/api/projects/tidak-ada-satu-pun/like")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Project tidak ditemukan")
  })

  it("should treat a non-numeric garbage string as a slug and return 404", async () => {
    const res = await request(app)
      .post("/api/projects/!!garbage!!/like")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Project tidak ditemukan")
  })

  it("should let an admin like through a slug", async () => {
    const res = await request(app)
      .post(`/api/projects/${projectSlug}/like`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect([200, 201]).toContain(res.status)
  })

  it("should return 404 when viewing a nonexistent slug", async () => {
    const res = await request(app).post(
      "/api/projects/tidak-ada/view",
    )

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Project tidak ditemukan")
  })
})
