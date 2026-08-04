const request = require("supertest")
const app = require("../server")
const { User } = require("../models")

describe("Rate Limiting", () => {
  beforeAll(async () => {
    await User.destroy({ where: {} })

    await request(app).post("/api/auth/register").send({
      name: "Limiter User",
      username: "limiteruser",
      email: "limiter@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })

    const user = await User.findOne({ where: { email: "limiter@example.com" } })
    user.is_verified = true
    await user.save()
  })

  it("should allow up to 5 login attempts", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "limiter@example.com", password: "WrongPassword123!" })

      expect(res.status).toBe(401)
    }
  })

  it("should rate-limit the 6th login attempt with 429", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "limiter@example.com", password: "WrongPassword123!" })

    expect(res.status).toBe(429)
  })

  it("should keep rejecting login while rate limited", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "limiter@example.com", password: "Password123!" })

    expect(res.status).toBe(429)
    expect(res.body.success).toBe(false)
  })

  it("should rate-limit registration after 5 attempts per hour", async () => {
    for (let i = 0; i < 4; i++) {
      await request(app).post("/api/auth/register").send({
        name: `Burst User ${i}`,
        username: `burstuser${i}`,
        email: `burst${i}@example.com`,
        password: "Password123!",
        tipe: "mahasiswa",
      })
    }

    const res = await request(app).post("/api/auth/register").send({
      name: "Burst User Last",
      username: "burstuserlast",
      email: "burstlast@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })

    expect(res.status).toBe(429)
    expect(res.body.success).toBe(false)
  })
})
