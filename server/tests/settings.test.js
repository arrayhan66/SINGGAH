const request = require("supertest")
const app = require("../server")
const { User, Setting } = require("../models")

describe("Settings Endpoints", () => {
  let adminToken = ""
  let userToken = ""

  beforeAll(async () => {
    await Setting.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Register & login Admin
    await request(app).post("/api/auth/register").send({
      name: "Admin Settings",
      username: "adminsettings",
      email: "adminsettings@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "adminsettings@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "adminsettings@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

    // Register & login Regular User
    await request(app).post("/api/auth/register").send({
      name: "User Settings",
      username: "usersettings",
      email: "usersettings@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })
    const user = await User.findOne({ where: { email: "usersettings@example.com" } })
    user.is_verified = true
    await user.save()
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "usersettings@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token
  })

  it("should get settings publicly", async () => {
    const res = await request(app).get("/api/settings")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should forbid non-admin from updating settings", async () => {
    const res = await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ site_name: "SINGGAH" })

    expect(res.status).toBe(403)
  })

  it("should require authentication to update settings", async () => {
    const res = await request(app)
      .put("/api/settings")
      .send({ site_name: "SINGGAH" })

    expect(res.status).toBe(401)
  })

  it("should allow admin to update settings", async () => {
    const res = await request(app)
      .put("/api/settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ site_name: "SINGGAH 2026" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("site_name", "SINGGAH 2026")
  })

  it("should reflect updated settings on public get", async () => {
    const res = await request(app).get("/api/settings")

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("site_name", "SINGGAH 2026")
  })
})
