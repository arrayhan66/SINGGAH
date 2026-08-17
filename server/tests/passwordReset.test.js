const request = require("supertest")
const app = require("../server")
const { User, VerificationCode, PasswordReset } = require("../models")

describe("Auth Flow: Verify Email & Reset Password", () => {
  const userData = {
    name: "Flow User",
    username: "flowuser",
    email: "flow@example.com",
    password: "OldPassword123!",
    tipe: "mahasiswa",
    nim_nip: "2023002",
  }

  beforeAll(async () => {
    await User.destroy({ where: {} })
  })

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send(userData)

    expect(res.status).toBe(201)
  })

  it("should verify email using the code stored in DB", async () => {
    const record = await VerificationCode.findOne({
      include: [{ model: User, where: { email: userData.email } }],
    })

    expect(record).not.toBeNull()

    const res = await request(app)
      .post("/api/auth/verify-email")
      .send({ email: userData.email, code: record.code })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should reject login with a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: "WrongPassword123!" })

    expect(res.status).toBe(401)
  })

  it("should request a password reset", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userData.email })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should verify the reset code", async () => {
    const record = await PasswordReset.findOne({
      include: [{ model: User, where: { email: userData.email } }],
    })

    expect(record).not.toBeNull()

    const res = await request(app)
      .post("/api/auth/verify-reset-code")
      .send({ email: userData.email, code: record.code })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should reject reset password with a wrong code", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: userData.email,
        code: "000000",
        newPassword: "NewPassword123!",
      })

    expect(res.status).toBe(400)
  })

  it("should reset the password with the correct code", async () => {
    const record = await PasswordReset.findOne({
      include: [{ model: User, where: { email: userData.email } }],
    })

    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: userData.email,
        code: record.code,
        newPassword: "NewPassword123!",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("should login with the new password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: "NewPassword123!" })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("token")
  })

  it("should reject login with the old password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: userData.email, password: userData.password })

    expect(res.status).toBe(401)
  })
})
