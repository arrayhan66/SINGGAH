const request = require("supertest")
const app = require("../server")
const { User } = require("../models")

describe("User Management Endpoints", () => {
  let adminToken = ""
  let userToken = ""
  let targetUserId = null

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

    // Register & login Regular User
    await request(app).post("/api/auth/register").send({
      name: "User Mgmt",
      username: "usermgmt",
      email: "usermgmt@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })
    const user = await User.findOne({ where: { email: "usermgmt@example.com" } })
    user.is_verified = true
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "usermgmt@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token
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

  it("should allow admin to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
