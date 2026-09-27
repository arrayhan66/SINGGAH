const request = require("supertest")
const app = require("../server")
const { User, ActivityLog } = require("../models")
const cache = require("../utils/cache")
const { authUserCacheKey } = require("../middlewares/authMiddleware")
const { createUser, tokenFor } = require("./helpers")

// Cache dimatikan secara default di mode test supaya deterministik. File ini
// justru butuh cache NYALA untuk membuktikan hook invalidasi benar-benar
// bekerja: kalau cache mati, setiap request baca database dan test akan hijau
// mesmo kalau hook-nya mati.
describe("Auth cache invalidasi saat role/status berubah", () => {
  let admin
  let member
  let memberToken = ""

  beforeAll(async () => {
    process.env.CACHE_IN_TEST = "true"

    await User.destroy({ where: {} })
    await ActivityLog.destroy({ where: {} })

    admin = await createUser({
      name: "Admin Cache HTTP",
      username: "admincachehttp",
      email: "admincachehttp@example.com",
      role: "admin",
      tipe: "admin",
    })
    member = await createUser({
      name: "Anggota Cache HTTP",
      username: "anggotacachehttp",
      email: "anggotacachehttp@example.com",
      role: "user",
      tipe: "mahasiswa",
      nim_nip: "2101010051",
    })
    memberToken = tokenFor(member)
  })

  afterAll(async () => {
    delete process.env.CACHE_IN_TEST
    await cache.clear?.()
  })

  it("should really be caching the user between requests", async () => {
    await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)

    const cached = await cache.get(authUserCacheKey(member.id))
    expect(cached).toBeTruthy()
    expect(cached.id).toBe(member.id)
  })

  it("should apply a bulk role change on the very next request", async () => {
    const before = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)
    expect(before.status).toBe(403)

    await User.update({ role: "admin" }, { where: { id: member.id } })

    const after = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)
    expect(after.status).toBe(200)
  })

  it("should apply a bulk status change on the very next request", async () => {
    await User.update({ role: "user" }, { where: { id: member.id } })
    const denied = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)
    expect(denied.status).toBe(403)

    await User.update(
      { status: "inactive" },
      { where: { id: [member.id] } },
    )

    const blocked = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)
    expect(blocked.status).toBe(403)
    expect(blocked.body.message).toMatch(/nonaktifkan/i)
  })

  it("should apply a single save immediately as well", async () => {
    await User.update({ status: "active" }, { where: { id: member.id } })

    member.role = "admin"
    await member.save()

    const res = await request(app)
      .get("/api/activity-logs")
      .set("Authorization", `Bearer ${memberToken}`)

    expect(res.status).toBe(200)
  })
})
