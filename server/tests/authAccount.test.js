const request = require("supertest")
const bcrypt = require("bcryptjs")
const app = require("../server")
const { User } = require("../models")
const { PASSWORD, createUser, tokenFor, createCategory, createProject } = require("./helpers")
const { COOKIE_NAME } = require("../utils/authCookie")

const NEW_PASSWORD = "Password456!"

describe("Auth: logout, profile-stats, change-password, hapus akun", () => {
  let admin
  let member
  let stranger
  let adminToken = ""
  let memberToken = ""

  beforeAll(async () => {
    await User.destroy({ where: {} })

    admin = await createUser({
      name: "Admin Akun",
      username: "adminakun",
      email: "adminakun@example.com",
      role: "admin",
      tipe: "admin",
    })
    member = await createUser({
      name: "Anggota Akun",
      username: "anggotaakun",
      email: "anggotaakun@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010011",
    })
    stranger = await createUser({
      name: "Orang Asing",
      username: "orangasing",
      email: "orangasing@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010012",
    })

    adminToken = tokenFor(admin)
    memberToken = tokenFor(member)
  })

  describe("POST /api/auth/logout", () => {
    it("should clear the auth cookie and return success", async () => {
      const res = await request(app).post("/api/auth/logout")

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const cookies = res.headers["set-cookie"] || []
      const cleared = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`))
      expect(cleared).toBeDefined()
      expect(cleared).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/i)
    })

    it("should not require authentication", async () => {
      const res = await request(app).post("/api/auth/logout")
      expect(res.status).toBe(200)
    })
  })

  describe("GET /api/auth/profile-stats", () => {
    beforeAll(async () => {
      const category = await createCategory({ name: "Kategori Stats" })
      await createProject(member, category, { status: "published" })
      await createProject(member, category, { status: "pending" })
      await createProject(member, category, { status: "rejected" })
      await createProject(stranger, category, { status: "published" })
    })

    it("should require authentication", async () => {
      const res = await request(app).get("/api/auth/profile-stats")
      expect(res.status).toBe(401)
    })

    it("should count only the caller's own projects", async () => {
      const res = await request(app)
        .get("/api/auth/profile-stats")
        .set("Authorization", `Bearer ${memberToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toEqual({
        published: 1,
        pending: 1,
        rejected: 1,
        total: 3,
      })
    })

    it("should return zeroes for a user without projects", async () => {
      const res = await request(app)
        .get("/api/auth/profile-stats")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toEqual({ published: 0, pending: 0, rejected: 0, total: 0 })
    })
  })

  describe("PUT /api/auth/change-password", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/auth/change-password")
        .send({ oldPassword: PASSWORD, newPassword: NEW_PASSWORD })

      expect(res.status).toBe(401)
    })

    it("should reject a wrong old password", async () => {
      const res = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${tokenFor(stranger)}`)
        .send({ oldPassword: "PasswordSalah123!", newPassword: NEW_PASSWORD })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Password lama salah/i)
    })

    it("should reject a new password that fails validation", async () => {
      const res = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${tokenFor(stranger)}`)
        .send({ oldPassword: PASSWORD, newPassword: "lemah" })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Password minimal 8 karakter/i)
    })

    it("should reject a missing old password", async () => {
      const res = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${tokenFor(stranger)}`)
        .send({ newPassword: NEW_PASSWORD })

      expect(res.status).toBe(400)
    })

    it("should change the password and let the new one be used to login", async () => {
      const strangerToken = tokenFor(stranger)

      const res = await request(app)
        .put("/api/auth/change-password")
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ oldPassword: PASSWORD, newPassword: NEW_PASSWORD })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      const after = await User.findByPk(stranger.id)
      expect(await bcrypt.compare(NEW_PASSWORD, after.password)).toBe(true)
      expect(await bcrypt.compare(PASSWORD, after.password)).toBe(false)

      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: "orangasing@example.com", password: NEW_PASSWORD })

      expect(login.status).toBe(200)
      expect(login.body.data.token).toBeTruthy()
    })
  })

  describe("DELETE /api/auth/account", () => {
    it("should require authentication", async () => {
      const res = await request(app).delete("/api/auth/account").send({ password: PASSWORD })
      expect(res.status).toBe(401)
    })

    it("should require a password", async () => {
      const res = await request(app)
        .delete("/api/auth/account")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({})

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Password wajib diisi untuk menghapus akun/i)
    })

    it("should reject a wrong password and keep the account", async () => {
      const res = await request(app)
        .delete("/api/auth/account")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ password: "PasswordSalah123!" })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Password salah/i)
      expect(await User.findByPk(member.id)).not.toBeNull()
    })

    it("should refuse to delete the last remaining admin", async () => {
      const res = await request(app)
        .delete("/api/auth/account")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ password: PASSWORD })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/admin terakhir/i)
      expect(await User.findByPk(admin.id)).not.toBeNull()
    })

    it("should delete the account and invalidate the token", async () => {
      const target = await createUser({
        name: "Akun Terhapus",
        username: "akunterhapus",
        email: "akunterhapus@example.com",
        tipe: "umum",
      })
      const targetToken = tokenFor(target)

      const res = await request(app)
        .delete("/api/auth/account")
        .set("Authorization", `Bearer ${targetToken}`)
        .send({ password: PASSWORD })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await User.findByPk(target.id)).toBeNull()

      const after = await request(app)
        .get("/api/auth/profile-stats")
        .set("Authorization", `Bearer ${targetToken}`)

      expect(after.status).toBe(401)
    })
  })
})
