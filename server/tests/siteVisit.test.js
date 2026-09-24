const request = require("supertest")
const app = require("../server")
const { SiteVisit } = require("../models")

describe("Site Visit Endpoints", () => {
  beforeAll(async () => {
    await SiteVisit.destroy({ where: {} })
  })

  it("should record a unique visit per IP per day", async () => {
    await request(app).post("/api/stats/visit").set("X-Forwarded-For", "1.2.3.4")
    await request(app).post("/api/stats/visit").set("X-Forwarded-For", "1.2.3.4")
    await request(app).post("/api/stats/visit").set("X-Forwarded-For", "5.6.7.8")

    const count = await SiteVisit.count()
    expect(count).toBe(2)
  })

  it("should expose totalVisitors from site visits in public stats", async () => {
    const res = await request(app).get("/api/stats")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("totalVisitors", 2)
  })

  it("should respond 200 even without a usable IP", async () => {
    const res = await request(app).post("/api/stats/visit")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe("Public Stats Endpoints", () => {
  beforeAll(async () => {
    await SiteVisit.destroy({ where: {} })
  })

  it("should return public stats shape", async () => {
    const res = await request(app).get("/api/stats")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("totalProject")
    expect(res.body.data).toHaveProperty("totalCategory")
    expect(res.body.data).toHaveProperty("totalUser")
    expect(res.body.data).toHaveProperty("totalVisitors")
    expect(res.body.data).toHaveProperty("totalViews")
  })
})