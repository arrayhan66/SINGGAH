const fs = require("fs")
const path = require("path")
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
      nim_nip: "2101010007",
    })

    const user = await User.findOne({ where: { email: "limiter@example.com" } })
    user.is_verified = true
    user.tipe = "mahasiswa"
    user.pending_tipe = null
    await user.save()
  })

  // Batas login mengikuti `max: effectiveMax(10)` di middlewares/rateLimiter.js,
  // dan `skipSuccessfulRequests: true` sehingga hanya percobaan GAGAL yang
  // memakai jatah. Test ini mengirim 10x password salah lalu memastikan
  // percobaan ke-11 diblokir.
  it("should allow up to 10 failed login attempts", async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "limiter@example.com", password: "WrongPassword123!" })

      expect(res.status).toBe(401)
    }
  })

  it("should rate-limit the 11th login attempt with 429", async () => {
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

// Regression: store memori dulu memaksa jendela 60 detik dan mengabaikan
// windowMs, sehingga setiap limiter jadi jauh lebih longgar dari yang
// dideklarasikan begitu Redis tidak aktif (login 5/15m -> 5/1m = 300/jam).
// Uji ini mengunci bahwa jendela fallback mengikuti windowMs masing-masing limiter.
describe("Rate Limiter memory-store window (fallback tanpa Redis)", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "..", "middlewares", "rateLimiter.js"),
    "utf8",
  )
  const start = src.indexOf("const DEFAULT_WINDOW_MS")
  const end = src.indexOf("function createStore")
  const createMemoryStore = new Function(
    src.slice(start, end) + "\nreturn createMemoryStore;",
  )()
  const MIN = 60 * 1000

  it("mengikuti windowMs yang dideklarasikan, bukan default 60 detik", async () => {
    const store = createMemoryStore()
    const cases = [
      ["login 15 menit", 15 * MIN],
      ["register 1 jam", 60 * MIN],
      ["view 1 menit", 1 * MIN],
    ]

    for (const [label, windowMs] of cases) {
      store.init({ windowMs })
      const res = await store.increment(`k-${label}`)
      const gotMs = res.resetTime.getTime() - Date.now()
      // toleransi 2 detik untuk selisih waktu eksekusi
      expect(Math.abs(gotMs - windowMs)).toBeLessThanOrEqual(2000)
    }
  })

  it("fallback aman ke 60 detik bila windowMs tidak valid", async () => {
    const store = createMemoryStore()
    for (const bad of [undefined, null, 0, -1, NaN, "abc"]) {
      store.init({ windowMs: bad })
      const res = await store.increment(`bad-${String(bad)}`)
      const gotMs = res.resetTime.getTime() - Date.now()
      expect(Math.abs(gotMs - 60 * 1000)).toBeLessThanOrEqual(2000)
    }
  })

  it("jendela tetap stabil saat hit counter bertambah", async () => {
    const store = createMemoryStore()
    store.init({ windowMs: 15 * MIN })
    const first = await store.increment("stabil")
    await store.increment("stabil")
    await store.increment("stabil")
    const last = await store.increment("stabil")

    expect(last.totalHits).toBe(4)
    expect(last.resetTime.getTime()).toBe(first.resetTime.getTime())
  })

  it("resetKey mengembalikan hit counter ke nol", async () => {
    const store = createMemoryStore()
    store.init({ windowMs: 15 * MIN })
    await store.increment("reset")
    await store.increment("reset")
    await store.resetKey("reset")
    const res = await store.increment("reset")
    expect(res.totalHits).toBe(1)
  })
})
