const request = require("supertest")
const app = require("../server")
const { User, VerificationCode } = require("../models")

describe("Auth Endpoints", () => {
  let authToken = ""
  let testUser = {
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
    tipe: "mahasiswa",
  }

  beforeAll(async () => {
    await User.destroy({ where: {} })
  })

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("email", testUser.email)
  })

  it("should verify email using verification code", async () => {
    const verificationRecord = await VerificationCode.findOne({
      include: [{ model: User, where: { email: testUser.email } }],
    })

    expect(verificationRecord).not.toBeNull()

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({
        email: testUser.email,
        code: verificationRecord.code,
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should login with valid credentials after verification", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("token")
    authToken = res.body.data.token
  })

  it("should get current user profile with auth token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("email", testUser.email)
  })
})
