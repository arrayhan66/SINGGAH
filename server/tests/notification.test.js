const request = require("supertest")
const app = require("../server")
const { User, Notification, Category } = require("../models")
const projectService = require("../services/projectService")

describe("Notification Endpoints", () => {
  let userToken = ""
  let otherUserToken = ""
  let adminToken = ""
  let userId = null
  let otherUserId = null
  let adminId = null
  let notificationId = null

  beforeAll(async () => {
    await User.destroy({ where: {} })

    await request(app).post("/api/auth/register").send({
      name: "Notification User",
      username: "notifuser",
      email: "notifuser@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010001",
    })
    const user = await User.findOne({ where: { email: "notifuser@example.com" } })
    user.is_verified = true
    user.tipe = "mahasiswa"
    user.pending_tipe = null
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
      nim_nip: "197001012000001001",
    })
    const otherUser = await User.findOne({ where: { email: "notifother@example.com" } })
    otherUser.is_verified = true
    otherUser.tipe = "dosen"
    otherUser.pending_tipe = null
    await otherUser.save()
    otherUserId = otherUser.id
    const otherLogin = await request(app).post("/api/auth/login").send({
      email: "notifother@example.com",
      password: "Password123!",
    })
    otherUserToken = otherLogin.body.data.token

    await request(app).post("/api/auth/register").send({
      name: "Admin User",
      username: "notifadmin",
      email: "notifadmin@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "notifadmin@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    adminId = adminUser.id
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "notifadmin@example.com",
      password: "Password123!",
    })
    adminToken = adminLogin.body.data.token

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

  it("should expose unreadCount when listing notifications", async () => {
    await Notification.update(
      { is_read: false },
      { where: { user_id: userId } },
    )

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("unreadCount", 2)
  })

  it("should mark a notification as unread", async () => {
    await request(app)
      .patch(`/api/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`)

    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/unread`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("is_read", false)
  })

  it("should return 404 when marking another user's notification as unread", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notificationId}/unread`)
      .set("Authorization", `Bearer ${otherUserToken}`)

    expect(res.status).toBe(404)
  })

  it("should require authentication to delete a notification", async () => {
    const res = await request(app).delete(
      `/api/notifications/${notificationId}`,
    )

    expect(res.status).toBe(401)
  })

  it("should not delete another user's notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)

    expect(res.status).toBe(404)
  })

  it("should delete a single notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${notificationId}`)
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    expect(list.body.data.items).toHaveLength(1)
  })

  it("should require authentication to bulk update", async () => {
    const res = await request(app).post("/api/notifications/bulk").send({
      ids: [1],
      action: "read",
    })

    expect(res.status).toBe(401)
  })

  it("should reject bulk update with invalid action", async () => {
    const res = await request(app)
      .post("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ids: [1], action: "invalid" })

    expect(res.status).toBe(400)
  })

  it("should reject bulk update with empty ids", async () => {
    const res = await request(app)
      .post("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ids: [], action: "read" })

    expect(res.status).toBe(400)
  })

  it("should bulk mark notifications as read and unread", async () => {
    const remaining = await Notification.findAll({ where: { user_id: userId } })

    const markRead = await request(app)
      .post("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        ids: remaining.map((n) => n.id),
        action: "read",
      })

    expect(markRead.status).toBe(200)
    expect(markRead.body.data.affected).toBe(remaining.length)

    const markUnread = await request(app)
      .post("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        ids: remaining.map((n) => n.id),
        action: "unread",
      })

    expect(markUnread.status).toBe(200)
    expect(markUnread.body.data.affected).toBe(remaining.length)
  })

  it("should require authentication to bulk delete", async () => {
    const res = await request(app)
      .delete("/api/notifications/bulk")
      .send({ ids: [1] })

    expect(res.status).toBe(401)
  })

  it("should reject bulk delete with empty ids", async () => {
    const res = await request(app)
      .delete("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ids: [] })

    expect(res.status).toBe(400)
  })

  it("should bulk delete selected notifications", async () => {
    const remaining = await Notification.findAll({ where: { user_id: userId } })
    expect(remaining.length).toBeGreaterThan(0)

    const res = await request(app)
      .delete("/api/notifications/bulk")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ids: remaining.map((n) => n.id) })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.affected).toBe(remaining.length)
  })

  it("should require authentication to delete all notifications", async () => {
    const res = await request(app).delete("/api/notifications/all")

    expect(res.status).toBe(401)
  })

  it("should delete all notifications for the user only", async () => {
    await Notification.create({
      user_id: userId,
      type: "announcement",
      title: "Akan dihapus",
      message: "Milik user utama",
    })

    const res = await request(app)
      .delete("/api/notifications/all")
      .set("Authorization", `Bearer ${userToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    expect(list.body.data.items).toHaveLength(0)
    expect(list.body.data.pagination.total).toBe(0)

    const otherList = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${otherUserToken}`)

    expect(otherList.body.data.pagination.total).toBe(1)
  })

  it("should require authentication to send an announcement", async () => {
    const res = await request(app).post("/api/notifications/announcements").send({
      title: "Pengumuman",
      message: "Isi pengumuman",
    })

    expect(res.status).toBe(401)
  })

  it("should forbid non-admin from sending an announcement", async () => {
    const res = await request(app)
      .post("/api/notifications/announcements")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Pengumuman", message: "Isi pengumuman" })

    expect(res.status).toBe(403)
  })

  it("should reject announcement with empty title", async () => {
    const res = await request(app)
      .post("/api/notifications/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "", message: "Isi pengumuman" })

    expect(res.status).toBe(400)
  })

  it("should reject announcement with invalid audience", async () => {
    const res = await request(app)
      .post("/api/notifications/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Pengumuman", message: "Isi pengumuman", audience: "robot" })

    expect(res.status).toBe(400)
  })

  it("should broadcast announcement to all users", async () => {
    const res = await request(app)
      .post("/api/notifications/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Pengumuman Sistem",
        message: "SINGGAH akan maintenance malam ini.",
        audience: "all",
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.affected).toBeGreaterThanOrEqual(2)

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    const announcement = list.body.data.items.find(
      (n) => n.type === "announcement" && n.title === "Pengumuman Sistem",
    )
    expect(announcement).toBeDefined()
    expect(announcement.message).toContain("maintenance")
  })

  it("should broadcast announcement to mahasiswa only", async () => {
    const res = await request(app)
      .post("/api/notifications/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Khusus Mahasiswa",
        message: "Pendaftaran karya dibuka.",
        audience: "mahasiswa",
      })

    expect(res.status).toBe(200)
    expect(res.body.data.affected).toBe(1)

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    const notif = list.body.data.items.find((n) => n.title === "Khusus Mahasiswa")
    expect(notif).toBeDefined()

    const otherList = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${otherUserToken}`)

    const dosenNotif = otherList.body.data.items.find(
      (n) => n.title === "Khusus Mahasiswa",
    )
    expect(dosenNotif).toBeUndefined()
  })

  it("should notify all admins when a pending project is submitted", async () => {
    const category = await Category.create({
      name: "Notif Category",
      slug: "notif-category",
      description: "Kategori uji notifikasi",
    })

    const user = await User.findByPk(userId)
    await user.update({ tipe: "mahasiswa" })

    const project = await projectService.createProject(
      {
        title: "Karya Uji Notifikasi",
        description: "Deskripsi karya uji",
        thumbnail: "https://example.com/thumb.jpg",
        year: 2026,
        category_id: category.id,
      },
      { id: userId, tipe: "mahasiswa", role: "user" },
    )

    expect(project.status).toBe("pending")

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${adminToken}`)

    const notif = list.body.data.items.find(
      (n) => n.type === "new_project" && n.reference_id === project.id,
    )
    expect(notif).toBeDefined()
    expect(notif.title).toContain("menunggu persetujuan")
    expect(notif.message).toContain("Karya Uji Notifikasi")
  })

  it("should notify the owner when an admin edits their project", async () => {
    const category = await Category.create({
      name: "Notif Edit Category",
      slug: "notif-edit-category",
      description: "Kategori uji edit",
    })

    const user = await User.findByPk(userId)
    await user.update({ tipe: "mahasiswa" })

    const project = await projectService.createProject(
      {
        title: "Karya Uji Edit",
        description: "Deskripsi sebelum diedit",
        thumbnail: "https://example.com/thumb.jpg",
        year: 2026,
        category_id: category.id,
      },
      { id: userId, tipe: "mahasiswa", role: "user" },
    )

    await projectService.updateProject(
      project.id,
      { title: "Karya Uji Edit (Revisi Admin)" },
      { id: adminId, role: "admin", tipe: "umum" },
    )

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    const notif = list.body.data.items.find(
      (n) => n.type === "project_updated" && n.reference_id === project.id,
    )
    expect(notif).toBeDefined()
    expect(notif.title).toContain("diperbarui admin")
    expect(notif.message).toContain("Karya Uji Edit (Revisi Admin)")
  })

  it("should notify the owner when an admin deletes their project", async () => {
    const category = await Category.create({
      name: "Notif Delete Category",
      slug: "notif-delete-category",
      description: "Kategori uji hapus",
    })

    const user = await User.findByPk(userId)
    await user.update({ tipe: "mahasiswa" })

    const project = await projectService.createProject(
      {
        title: "Karya Uji Hapus",
        description: "Deskripsi sebelum dihapus",
        thumbnail: "https://example.com/thumb.jpg",
        year: 2026,
        category_id: category.id,
      },
      { id: userId, tipe: "mahasiswa", role: "user" },
    )

    await projectService.deleteProject(project.id, {
      id: adminId,
      role: "admin",
      tipe: "umum",
    })

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${userToken}`)

    const notif = list.body.data.items.find(
      (n) => n.type === "project_deleted" && n.reference_id === project.id,
    )
    expect(notif).toBeDefined()
    expect(notif.title).toContain("dihapus admin")
    expect(notif.message).toContain("Karya Uji Hapus")
  })
})
