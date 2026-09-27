const request = require("supertest")
const app = require("../server")
const { User, Setting } = require("../models")

const ADMIN = {
  name: "Admin Maintenance",
  username: "adminmaint",
  email: "adminmaint@example.com",
  password: "Password123!",
  tipe: "admin",
}

const USER = {
  name: "User Maintenance",
  username: "usermaint",
  email: "usermaint@example.com",
  password: "Password123!",
  tipe: "mahasiswa",
  nim_nip: "2101010099",
}

const setMaintenance = (token, value) =>
  request(app)
    .put("/api/settings")
    .set("Authorization", `Bearer ${token}`)
    .send({ maintenanceMode: value })

describe("Maintenance Mode Middleware", () => {
  let adminToken = ""
  let adminCookie = ""
  let userToken = ""
  let userCookie = ""

  beforeAll(async () => {
    await Setting.destroy({ where: {} })
    await User.destroy({ where: {} })

    for (const payload of [ADMIN, USER]) {
      const registered = await request(app)
        .post("/api/auth/register")
        .send(payload)
      expect(registered.status).toBe(201)
    }

    const admin = await User.findOne({ where: { email: ADMIN.email } })
    admin.is_verified = true
    admin.role = "admin"
    await admin.save()

    const student = await User.findOne({ where: { email: USER.email } })
    student.is_verified = true
    student.tipe = "mahasiswa"
    student.pending_tipe = null
    student.role = "user"
    await student.save()

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password })
    adminToken = adminLogin.body.data.token
    adminCookie = adminLogin.headers["set-cookie"]

    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: USER.email, password: USER.password })
    userToken = userLogin.body.data.token
    userCookie = userLogin.headers["set-cookie"]
  })

  afterAll(async () => {
    const spy = jest.spyOn(Setting, "findOne")
    await setMaintenance(adminToken, false)
    spy.mockRestore()
  })

  it("should keep the site reachable while maintenance mode is off", async () => {
    await setMaintenance(adminToken, false)

    const res = await request(app).get("/api/news")

    expect(res.status).toBe(200)
  })

  it("should reject anonymous reads with 503 while maintenance mode is on", async () => {
    await setMaintenance(adminToken, true)

    const news = await request(app).get("/api/news")
    const projects = await request(app).get("/api/projects")

    expect(news.status).toBe(503)
    expect(news.body.success).toBe(false)
    expect(news.body.message).toMatch(/maintenance/i)
    expect(projects.status).toBe(503)
  })

  it("should reject anonymous writes with 503, not 401, while maintenance is on", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: "Kategori Maintenance", slug: "kategori-maintenance" })

    expect(res.status).toBe(503)
  })

  it("should still serve the whitelisted settings endpoint", async () => {
    const res = await request(app).get("/api/settings")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should still allow an admin to log in through the whitelisted endpoint", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toEqual(expect.any(String))
  })

  it("should refuse a non-admin login while maintenance mode is on", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: USER.email, password: USER.password })

    expect(res.status).toBe(503)
  })

  it("should block registration because it is not whitelisted", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Blocked User",
        username: "blockedmaint",
        email: "blockedmaint@example.com",
        password: "Password123!",
        tipe: "mahasiswa",
        nim_nip: "2101010088",
      })

    expect(res.status).toBe(503)
  })

  it("should let an admin through with a bearer token", async () => {
    const res = await request(app)
      .get("/api/news")
      .set("Authorization", `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
  })

  it("should block a non-admin bearer token", async () => {
    const res = await request(app)
      .get("/api/news")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(503)
  })

  it("should let an admin through with an httpOnly cookie", async () => {
    const res = await request(app).get("/api/news").set("Cookie", adminCookie)

    expect(res.status).toBe(200)
  })

  it("should block a non-admin cookie", async () => {
    const res = await request(app).get("/api/news").set("Cookie", userCookie)

    expect(res.status).toBe(503)
  })

  it("should treat a tampered token as blocked instead of crashing", async () => {
    const tampered = `${adminToken.slice(0, -3)}xyz`
    const garbage = "not-a-jwt-at-all"

    const bad = await request(app)
      .get("/api/news")
      .set("Authorization", `Bearer ${tampered}`)
    const worse = await request(app)
      .get("/api/news")
      .set("Authorization", `Bearer ${garbage}`)
    const badCookie = await request(app)
      .get("/api/news")
      .set("Cookie", `singgah_token=${garbage}`)

    expect(bad.status).toBe(503)
    expect(worse.status).toBe(503)
    expect(badCookie.status).toBe(503)
  })

  it("should let an admin switch maintenance mode back off", async () => {
    const res = await setMaintenance(adminToken, false)

    expect(res.status).toBe(200)

    const news = await request(app).get("/api/news")
    expect(news.status).toBe(200)
  })

  it("should fail open when the setting lookup throws", async () => {
    const spy = jest
      .spyOn(Setting, "findOne")
      .mockRejectedValueOnce(new Error("database tidak tersedia"))

    const res = await request(app).get("/api/news")

    spy.mockRestore()

    expect(res.status).toBe(200)
  })

  it("should ignore unrelated cookies when looking for the session token", async () => {
    await setMaintenance(adminToken, true)

    const res = await request(app)
      .get("/api/news")
      .set("Cookie", "theme=dark; singgah_other=xyz")

    expect(res.status).toBe(503)
  })
})
