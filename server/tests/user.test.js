const request = require("supertest")
const app = require("../server")
const { User, Notification } = require("../models")

describe("User Management Endpoints", () => {
  let adminToken = ""
  let userToken = ""
  let targetUserId = null
  let pendingUserId = null
  let rejectUserId = null

  beforeAll(async () => {
    await User.destroy({ where: {} })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin User Mgmt",
      username: "adminusermgmt",
      email: "adminusermgmt@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "adminusermgmt@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "adminusermgmt@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Regular User (pending mahasiswa)
    await request(app)
      .post("/api/auth/register")
      .field("name", "User Mgmt")
      .field("username", "usermgmt")
      .field("email", "usermgmt@example.com")
      .field("password", "Password123!")
      .field("tipe", "mahasiswa")
      .field("nim_nip", "2023001")
      .attach("identitas_photo", Buffer.from("fake-image-bytes"), {
        filename: "ktm.jpg",
        contentType: "image/jpeg",
      })
    const user = await User.findOne({ where: { email: "usermgmt@example.com" } })
    pendingUserId = user.id
    user.is_verified = true
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "usermgmt@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token

    // Register a pending mahasiswa to be rejected
    await request(app)
      .post("/api/auth/register")
      .field("name", "Reject User")
      .field("username", "rejectuser")
      .field("email", "rejectuser@example.com")
      .field("password", "Password123!")
      .field("tipe", "mahasiswa")
      .field("nim_nip", "2023002")
      .attach("identitas_photo", Buffer.from("fake-image-bytes"), {
        filename: "ktm.jpg",
        contentType: "image/jpeg",
      })
    const rejectUser = await User.findOne({
      where: { email: "rejectuser@example.com" },
    })
    rejectUserId = rejectUser.id
    rejectUser.is_verified = true
    await rejectUser.save()
  })

  it("should require authentication to list users", async () => {
    const res = await request(app).get("/api/users")

    expect(res.status).toBe(401)
  })

  it("should forbid non-admin from listing users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(403)
  })

  it("should allow admin to create a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dosen Pembimbing",
        username: "dosenpembimbing",
        email: "dosen@example.com",
        password: "Password123!",
        tipe: "dosen",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("email", "dosen@example.com")
    targetUserId = res.body.data.id
  })

  it("should validate duplicate email on user create", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dosen Lain",
        username: "dosenlain",
        email: "dosen@example.com",
        password: "Password123!",
      })

    expect(res.status).toBe(400)
  })

  it("should allow admin to list users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items.length).toBeGreaterThan(0)
  })

  it("should allow admin to get user by id", async () => {
    const res = await request(app)
      .get(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("id", targetUserId)
  })

  it("should allow admin to update a user", async () => {
    const res = await request(app)
      .put(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Dosen Pembimbing Utama" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("name", "Dosen Pembimbing Utama")
  })

  it("should preserve dots in email local-part when admin updates a user", async () => {
    const res = await request(app)
      .put(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "dosen.pembimbing@gmail.com" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty(
      "email",
      "dosen.pembimbing@gmail.com",
    )
  })

  it("should preserve dots in email local-part when admin creates a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Dosen Titik",
        username: "dosentitik",
        email: "dosen.titik@gmail.com",
        password: "Password123!",
        tipe: "dosen",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("email", "dosen.titik@gmail.com")
  })

  it("should list pending users for admin with verification=pending", async () => {
    const res = await request(app)
      .get("/api/users?verification=pending")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(
      res.body.data.items.every((u) => u.pending_tipe !== null),
    ).toBe(true)
  })

  it("should forbid non-admin from approving tipe", async () => {
    const res = await request(app)
      .post(`/api/users/${pendingUserId}/approve-tipe`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ approved: true })

    expect(res.status).toBe(403)
  })

  it("should allow admin to approve pending tipe", async () => {
    const res = await request(app)
      .post(`/api/users/${pendingUserId}/approve-tipe`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ approved: true })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("tipe", "mahasiswa")
    expect(res.body.data).toHaveProperty("pending_tipe", null)
    expect(res.body.data.approved).toBe(true)
  })

  it("should reject approve when user has no pending tipe", async () => {
    const res = await request(app)
      .post(`/api/users/${targetUserId}/approve-tipe`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ approved: true })

    expect(res.status).toBe(400)
  })

  it("should require reason when rejecting tipe", async () => {
    const res = await request(app)
      .post(`/api/users/${rejectUserId}/approve-tipe`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ approved: false })

    expect(res.status).toBe(400)
  })

  it("should allow admin to reject tipe with reason", async () => {
    const res = await request(app)
      .post(`/api/users/${rejectUserId}/approve-tipe`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ approved: false, reason: "Foto KTM tidak jelas" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("tipe", "umum")
    expect(res.body.data).toHaveProperty("pending_tipe", null)
    expect(res.body.data).toHaveProperty(
      "rejection_reason",
      "Foto KTM tidak jelas",
    )
    expect(res.body.data.approved).toBe(false)
  })

  it("should notify user when tipe is rejected with reason", async () => {
    const notification = await Notification.findOne({
      where: {
        user_id: rejectUserId,
        type: "tipe_rejected",
      },
      order: [["created_at", "DESC"]],
    })

    expect(notification).not.toBeNull()
    expect(notification.message).toContain("Foto KTM tidak jelas")
  })

  it("should allow admin to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
