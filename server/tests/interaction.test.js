const request = require("supertest")
const app = require("../server")
const { User, Category, Project } = require("../models")

describe("Interaction Endpoints (Bookmark, Like, Comment, Reply)", () => {
  let adminToken = ""
  let studentToken = ""
  let otherStudentToken = ""
  let projectId = null
  let commentId = null
  let replyId = null

  beforeAll(async () => {
    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    const category = await Category.create({
      name: "Mobile App",
      slug: "mobile-app",
      description: "Mobile projects",
    })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin",
      username: "admininteract",
      email: "admininteract@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "admininteract@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admininteract@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Student
    await request(app).post("/api/auth/register").send({
      name: "Student",
      username: "studentinteract",
      email: "studentinteract@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010008",
    })
    const studentUser = await User.findOne({ where: { email: "studentinteract@example.com" } })
    studentUser.is_verified = true
    studentUser.tipe = "mahasiswa"
    studentUser.pending_tipe = null
    await studentUser.save()
    const studentLogin = await request(app).post("/api/auth/login").send({
      email: "studentinteract@example.com",
      password: "Password123!",
    })
    studentToken = studentLogin.body.data.token

    // Register another student (not the comment owner)
    await request(app).post("/api/auth/register").send({
      name: "Other Student",
      username: "otherstudentinteract",
      email: "otherstudentinteract@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010009",
    })
    const otherStudentUser = await User.findOne({ where: { email: "otherstudentinteract@example.com" } })
    otherStudentUser.is_verified = true
    otherStudentUser.tipe = "mahasiswa"
    otherStudentUser.pending_tipe = null
    await otherStudentUser.save()
    const otherStudentLogin = await request(app).post("/api/auth/login").send({
      email: "otherstudentinteract@example.com",
      password: "Password123!",
    })
    otherStudentToken = otherStudentLogin.body.data.token

    // Create a published project directly
    const project = await Project.create({
      title: "E-Commerce App",
      slug: "e-commerce-app",
      thumbnail: "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      description: "A mobile shopping app",
      year: 2026,
      status: "published",
      user_id: adminUser.id,
      category_id: category.id,
    })
    projectId = project.id
  })

  describe("Bookmark", () => {
    it("should toggle bookmark on a project", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/bookmark`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("bookmarked", true)
    })

    it("should list user bookmarks", async () => {
      const res = await request(app)
        .get("/api/projects/my-bookmarks")
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it("should remove bookmark on second toggle", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/bookmark`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty("bookmarked", false)
    })
  })

  describe("Like", () => {
    it("should like a project", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/like`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("liked", true)
      expect(res.body.data).toHaveProperty("likesCount", 1)
    })

    it("should get like count", async () => {
      const res = await request(app).get(`/api/projects/${projectId}/likes`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("likesCount", 1)
    })

    it("should unlike a project on second toggle", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/like`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty("liked", false)
      expect(res.body.data).toHaveProperty("likesCount", 0)
    })
  })

  describe("Comment & Reply", () => {
    it("should add a comment to a project", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/comments`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ text: "Keren sekali project-nya!" })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("id")
      commentId = res.body.data.id
    })

    it("should list comments for a project", async () => {
      const res = await request(app).get(`/api/projects/${projectId}/comments`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it("should reply to a comment", async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/comments/${commentId}/replies`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ text: "Terima kasih!" })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("id")
      replyId = res.body.data.id
    })

    it("should list replies of a comment", async () => {
      const res = await request(app).get(
        `/api/projects/${projectId}/comments/${commentId}/replies`,
      )

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it("should count comments including replies", async () => {
      const res = await request(app).get(`/api/projects/${projectId}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("commentsCount", 2)
    })

    it("should update a comment", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ text: "Keren sekali, updated!" })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.text).toBe("Keren sekali, updated!")
    })

    it("should not update another user's comment", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${otherStudentToken}`)
        .send({ text: "hack" })

      expect(res.status).toBe(403)
    })

    it("should not allow admin to update a student's comment", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ text: "admin edit" })

      expect(res.status).toBe(403)
    })

    it("should update a reply", async () => {
      const res = await request(app)
        .put(`/api/projects/${projectId}/comments/${commentId}/replies/${replyId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ text: "Terima kasih, updated!" })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.text).toBe("Terima kasih, updated!")
    })

    it("should delete a reply", async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/comments/${commentId}/replies/${replyId}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it("should delete a comment", async () => {
      const res = await request(app)
        .delete(`/api/projects/${projectId}/comments/${commentId}`)
        .set("Authorization", `Bearer ${studentToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
