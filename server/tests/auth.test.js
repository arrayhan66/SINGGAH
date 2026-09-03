const request = require("supertest")
const bcrypt = require("bcryptjs")
jest.mock("dns", () => ({
  promises: {
    resolveMx: jest.fn(),
  },
}))
jest.mock("../services/googleAuthService", () => ({
  verifyGoogleToken: jest.fn(),
}))
const app = require("../server")
const { User, VerificationCode, Notification } = require("../models")
const { resolveMx } = require("dns").promises
const { verifyGoogleToken } = require("../services/googleAuthService")

describe("Auth Endpoints", () => {
  let authToken = ""
  let testUser = {
    name: "Test User",
    username: "testuser",
    email: "test@example.com",
    password: "Password123!",
    tipe: "mahasiswa",
    nim_nip: "1234567890",
  }

  beforeAll(async () => {
    await User.destroy({ where: {} })
  })

  beforeEach(() => {
    resolveMx.mockReset()
    resolveMx.mockResolvedValue([{ exchange: "mx.example.com" }])
  })

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("name", testUser.name)
      .field("username", testUser.username)
      .field("email", testUser.email)
      .field("password", testUser.password)
      .field("tipe", testUser.tipe)
      .field("nim_nip", testUser.nim_nip)
      .attach("identitas_photo", Buffer.from("fake-image-bytes"), {
        filename: "ktm.jpg",
        contentType: "image/jpeg",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("email", testUser.email)
  })

  it("should register a new user with an avatar photo", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("name", "Avatar User")
      .field("username", "avataruser")
      .field("email", "avatar@example.com")
      .field("password", "Password123!")
      .field("tipe", "umum")
      .attach("avatar", Buffer.from("fake-image-bytes"), {
        filename: "avatar.jpg",
        contentType: "image/jpeg",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    const user = await User.findOne({ where: { email: "avatar@example.com" } })
    expect(user).not.toBeNull()
    expect(user.avatar).toBe("https://test.local/uploads/avatars/test.jpg")
  })

  it("should register with identitas photo and notify admins", async () => {
    await User.create({
      name: "Admin Test",
      username: "admintest",
      email: "admintest@example.com",
      password: "Password123!",
      role: "admin",
      tipe: "admin",
      is_verified: true,
    })

    const res = await request(app)
      .post("/api/auth/register")
      .field("name", "Identitas User")
      .field("username", "identitasuser")
      .field("email", "identitas@example.com")
      .field("password", "Password123!")
      .field("tipe", "mahasiswa")
      .field("nim_nip", "9988776655")
      .attach("identitas_photo", Buffer.from("fake-image-bytes"), {
        filename: "ktm.jpg",
        contentType: "image/jpeg",
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)

    const user = await User.findOne({
      where: { email: "identitas@example.com" },
    })
    expect(user).not.toBeNull()
    expect(user.identitas_photo).toBe(
      "https://test.local/uploads/identitas/test.jpg",
    )

    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id"],
    })
    const adminNotifs = await Notification.findAll({
      where: {
        user_id: admins.map((a) => a.id),
        type: "user_registered",
        reference_id: user.id,
      },
    })
    expect(adminNotifs.length).toBeGreaterThan(0)
  })

  it("should keep tipe as umum with pending_tipe for mahasiswa/dosen registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .field("name", "Pending Dosen")
      .field("username", "pendingdosen")
      .field("email", "pendingdosen@example.com")
      .field("password", "Password123!")
      .field("tipe", "dosen")
      .field("nim_nip", "198001012000031001")
      .attach("identitas_photo", Buffer.from("fake-image-bytes"), {
        filename: "kartu.jpg",
        contentType: "image/jpeg",
      })

    expect(res.status).toBe(201)
    expect(res.body.data.tipe).toBe("umum")
    expect(res.body.data.pending_tipe).toBe("dosen")
  })

  it("should require nim_nip for mahasiswa/dosen registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Tanpa NIM",
        username: "tanpanim",
        email: "tanpanim@example.com",
        password: "Password123!",
        tipe: "mahasiswa",
      })

    expect(res.status).toBe(400)
  })

  it("should apply tipe for a verified umum user", async () => {
    await User.create({
      name: "Apply User",
      username: "applyuser",
      email: "applyuser@example.com",
      password: await bcrypt.hash("Password123!", 10),
      tipe: "umum",
      nim_nip: "20230501",
      identitas_photo:
        "https://res.cloudinary.com/test/image/upload/v123456/test.jpg",
      is_verified: true,
    })

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "applyuser@example.com",
      password: "Password123!",
    })
    const applyToken = loginRes.body.data.token

    const res = await request(app)
      .post("/api/auth/apply-tipe")
      .set("Authorization", `Bearer ${applyToken}`)
      .send({ tipe: "mahasiswa" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty("tipe", "umum")
    expect(res.body.data).toHaveProperty("pending_tipe", "mahasiswa")
    expect(res.body.data).toHaveProperty("rejection_reason", null)
  })

  it("should reject apply-tipe when already pending", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "applyuser@example.com",
      password: "Password123!",
    })
    const applyToken = loginRes.body.data.token

    const res = await request(app)
      .post("/api/auth/apply-tipe")
      .set("Authorization", `Bearer ${applyToken}`)
      .send({ tipe: "dosen" })

    expect(res.status).toBe(400)
  })

  it("should allow re-apply after rejection and clear rejection_reason", async () => {
    const applyUser = await User.findOne({
      where: { email: "applyuser@example.com" },
    })

    const admin = await User.create({
      name: "Admin Apply",
      username: "adminapply",
      email: "adminapply@example.com",
      password: await bcrypt.hash("Password123!", 10),
      role: "admin",
      tipe: "admin",
      is_verified: true,
    })

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: admin.email,
      password: "Password123!",
    })
    const adminToken = adminLogin.body.data.token

    const rejectRes = await request(app)
      .post(`/api/users/${applyUser.id}/approve-tipe`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ approved: false, reason: "Foto KTM kurang jelas" })

    expect(rejectRes.status).toBe(200)
    expect(rejectRes.body.data).toHaveProperty(
      "rejection_reason",
      "Foto KTM kurang jelas",
    )

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "applyuser@example.com",
      password: "Password123!",
    })
    expect(loginRes.body.data.user).toHaveProperty(
      "rejection_reason",
      "Foto KTM kurang jelas",
    )
    const applyToken = loginRes.body.data.token

    // User updates profile with new valid NIM and photo before re-applying
    await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${applyToken}`)
      .field("name", "Apply User")
      .field("username", "applyuser")
      .field("email", "applyuser@example.com")
      .field("nim_nip", "20230501")
      .attach("identitas_photo", Buffer.from("new-fake-image"), {
        filename: "ktm_baru.jpg",
        contentType: "image/jpeg",
      })

    const res = await request(app)
      .post("/api/auth/apply-tipe")
      .set("Authorization", `Bearer ${applyToken}`)
      .send({ tipe: "mahasiswa" })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("pending_tipe", "mahasiswa")
    expect(res.body.data).toHaveProperty("rejection_reason", null)
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

  it("should report email as not registered and suggest domain typo fix", async () => {
    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "test@gmaill.com" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(false)
    expect(res.body.data.verified).toBe(false)
    expect(res.body.data.suggestion).toBe("test@gmail.com")
    expect(res.body.data.domain).toBe("gmaill.com")
    expect(res.body.data.domainValid).toBe(true)
  })

  it("should flag a domain with no mail server as invalid", async () => {
    resolveMx.mockReset()
    resolveMx.mockResolvedValue([])

    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "someone@nodomainhere.zzz" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(false)
    expect(res.body.data.domain).toBe("nodomainhere.zzz")
    expect(res.body.data.domainValid).toBe(false)

    resolveMx.mockResolvedValue([{ exchange: "mx.example.com" }])
  })

  it("should report an existing verified email as registered & verified", async () => {
    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "TEST@EXAMPLE.COM" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(true)
    expect(res.body.data.verified).toBe(true)
    expect(res.body.data.tipe).toBe("umum")
  })

  it("should report existing unverified email as registered but not verified", async () => {
    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "avatar@example.com" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(true)
    expect(res.body.data.verified).toBe(false)
  })

  it("should not suggest a different provider for a valid known email", async () => {
    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "singgah.poliban@gmail.com" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(false)
    expect(res.body.data.suggestion).toBeNull()
  })

  it("should suggest a similar registered email for a typo", async () => {
    const res = await request(app)
      .post("/api/auth/check-email")
      .send({ email: "avtar@example.com" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.exists).toBe(false)
    expect(res.body.data.suggestion).toBe("avatar@example.com")
  })
})

describe("Google Login", () => {
  beforeEach(() => {
    verifyGoogleToken.mockReset()
  })

  it("should reject request without token", async () => {
    const res = await request(app).post("/api/auth/google").send({})

    expect(res.status).toBe(400)
  })

  it("should create a new umum user on first google login", async () => {
    verifyGoogleToken.mockResolvedValue({
      email: "google.newuser@gmail.com",
      name: "Google New User",
      sub: "google-sub-12345",
      picture: "https://example.com/pic.png",
    })

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "fake-id-token" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe("google.newuser@gmail.com")
    expect(res.body.data.user.tipe).toBe("umum")
    expect(res.body.data.user.is_verified).toBe(true)
    expect(res.body.data.user.google_id).toBe("google-sub-12345")

    const user = await User.findOne({ where: { email: "google.newuser@gmail.com" } })
    expect(user).not.toBeNull()
    expect(user.google_id).toBe("google-sub-12345")
  })

  it("should login existing google user and not duplicate", async () => {
    verifyGoogleToken.mockResolvedValue({
      email: "google.newuser@gmail.com",
      name: "Google New User",
      sub: "google-sub-12345",
    })

    const countBefore = await User.count({
      where: { email: "google.newuser@gmail.com" },
    })
    expect(countBefore).toBe(1)

    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "fake-id-token-2" })

    expect(res.status).toBe(200)
    const countAfter = await User.count({
      where: { email: "google.newuser@gmail.com" },
    })
    expect(countAfter).toBe(1)
  })

  it("should reject an invalid google token", async () => {
    verifyGoogleToken.mockRejectedValue(new Error("invalid token"))
    const res = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "bad-token" })
    expect(res.status).toBe(401)
  })
})
