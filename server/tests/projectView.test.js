const request = require("supertest")
const app = require("../server")
const { User, Category, Project, ProjectView } = require("../models")

describe("Project View Endpoints", () => {
  let projectId = null

  beforeAll(async () => {
    await ProjectView.destroy({ where: {} })
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    const user = await User.create({
      name: "View Tester",
      username: "viewtester",
      email: "viewtester@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      is_verified: true,
    })

    const category = await Category.create({
      name: "View Category",
      slug: "view-category",
    })

    const project = await Project.create({
      title: "Project View Test",
      slug: "project-view-test",
      thumbnail: "https://res.cloudinary.com/test/image/upload/v123456/view.jpg",
      description: "Project untuk test view",
      year: 2026,
      status: "published",
      user_id: user.id,
      category_id: category.id,
    })
    projectId = project.id
  })

  it("should record a view for a project", async () => {
    const res = await request(app).post(`/api/projects/${projectId}/view`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("viewsCount", 1)
  })

  it("should deduplicate a view from the same IP within 24 hours", async () => {
    const res = await request(app).post(`/api/projects/${projectId}/view`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("viewsCount", 1)
  })

  it("should return 404 for a non-existent project", async () => {
    const res = await request(app).post("/api/projects/999999/view")

    expect(res.status).toBe(404)
  })
})
