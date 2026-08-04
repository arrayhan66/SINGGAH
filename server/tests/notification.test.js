const request = require("supertest")
const app = require("../server")
const { User, Notification } = require("../models")

describe("Notification Endpoints", () => {
  let userToken = ""
  let otherUserToken = ""
  let userId = null
  let otherUserId = null
  let notificationId = null

  beforeAll(async () => {
    await User.destroy({ where: {} })

    await request(app).post("/api/auth/register").send({
      name: "Notification User",
      username: "notifuser",
      email: "notifuser@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
    })
    const user = await User.findOne({ where: { email: "notifuser@example.com" } })
    user.is_verified = true
    await user.save()
    userId = user.id
    const userLogin = await request(app).post("/api/auth/login").send({
      email: "notifuser@example.com",
      password: "Password123!",
    })
    userToken = userLogin.body.data.token

    await request(app).post("/api/auth/register").send({
      name: "Other User",
      username: "notifother",
      email: "notifother@example.com",
      password: "Password123!",
      tipe: "dosen",
    })
    const otherUser = await User.findOne({ where: { email: "notifother@example.com" } })
    otherUser.is_verified = true
    await otherUser.save()
    otherUserId = otherUser.id
    const otherLogin = await request(app).post("/api/auth/login").send({
      email: "notifother@example.com",
      password: "Password123!",
    })
    otherUserToken = otherLogin.body.data.token

    const notification = await Notification.create({
      user_id: userId,
      type: "like",
      title: "Project disukai",
      message: "Pengguna lain menyukai project Anda",
      reference_type: "project",
      reference_id: 1,
    })
    notificationId = notification.id

    await Notification.create({
      user_id: userId,
      type: "comment",
      title: "Komentar baru",
      message: "Pengguna lain memberi komentar",
      reference_type: "project",
      reference_id: 1,
    })

    await Notification.create({
      user_id: otherUserId,
      type: "like",
      title: "Project orang lain",
      message: "Bukan milik user utama",
      reference_type: "project",
      reference_id: 1,
    })
  })

  it("should require authentication to list notifications", async () => {
    const res = await request(app).get("/api/notifications")

    expect(res.status).toBe(401)
  })

  it("should list own notifications with pagination", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.items)).toBe(true)
    expect(res.body.data.items).toHaveLength(2)
    expect(res.body.data.pagination).toHaveProperty("total", 2)
    expect(res.body.data.pagination).toHaveProperty("totalPages", 1)
  })

  it("should require authentication to mark as read", async () => {
    const res = await request(app).patch(`/api/notifications/${notificationId}/read`)

    expect(res.status).toBe(401)
  })

  it("should not mark another user's notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${otherUserToken}`)

    expect(res.status).toBe(404)
  })

  it("should return 404 for non-existent notification", async () => {
    const res = await request(app)
      .patch("/api/notifications/999999/read")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(404)
  })

  it("should mark notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("is_read", true)
  })

  it("should require authentication to mark all as read", async () => {
    const res = await request(app).patch("/api/notifications/read-all")

    expect(res.status).toBe(401)
  })

  it("should mark all notifications as read", async () => {
    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    const unread = list.body.data.items.filter((n) => !n.is_read)
    expect(unread).toHaveLength(0)
  })
})
