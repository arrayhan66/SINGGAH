const request = require("supertest")
const bcrypt = require("bcryptjs")
const app = require("../server")
const { User, VerificationCode } = require("../models")
const generateToken = require("../utils/generateToken")

describe("Profile Email Change Flow", () => {
  const password = "Password123!"
  let changeToken
  let changeUser

  beforeAll(async () => {
    changeUser = await User.create({
      name: "Email Change User",
      username: "emailchangeuser",
      email: "change@example.com",
      password: await bcrypt.hash(password, 10),
      tipe: "umum",
      is_verified: true,
    })

    await User.create({
      name: "Owner User",
      username: "owneruser",
      email: "owner@example.com",
      password: await bcrypt.hash(password, 10),
      tipe: "umum",
      is_verified: true,
    })

    changeToken = generateToken(changeUser)
  })

  it("should reject invalid email format", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .field("email", "not-an-email")

    expect(res.status).toBe(400)
  })

  it("should reject an email already used by another account", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .field("email", "owner@example.com")

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Email sudah digunakan")
  })

  it("should reject an email already pending on another account", async () => {
    const rival = await User.create({
      name: "Rival User",
      username: "rivaluser",
      email: "rival@example.com",
      password: await bcrypt.hash(password, 10),
      tipe: "umum",
      is_verified: true,
    })
    const rivalToken = generateToken(rival)

    const rivalRes = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${rivalToken}`)
      .field("name", "Rival User")
      .field("username", "rivaluser")
      .field("email", "pendingdup@example.com")

    expect(rivalRes.status).toBe(200)
    expect(rivalRes.body.data.pending_email).toBe("pendingdup@example.com")

    const dupRes = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .field("email", "pendingdup@example.com")

    expect(dupRes.status).toBe(400)
    expect(dupRes.body.message).toBe("Email sudah digunakan")
  })

  it("should reject registration with an email already pending on another account", async () => {
    // pendingdup@example.com saat ini adalah pending_email milik rival (test
    // di atas). register dulu hanya mengecek kolom `email`, sehingga email ini
    // bisa didaftarkan ulang; ketika rival memverifikasi, promosi pending_email
    // ke email menabrak unique constraint dan akun lama gagal verifikasi.
    const res = await request(app).post("/api/auth/register").send({
      name: "Late User",
      username: "lateuser",
      email: "pendingdup@example.com",
      password: "Password123!",
      tipe: "umum",
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Email sudah digunakan")

    const created = await User.findOne({
      where: { email: "pendingdup@example.com" },
    })
    expect(created).toBeNull()
  })

  it("should return 400 (not 500) for an unexpected upload field", async () => {
    // Multer melempar MulterError untuk field yang tidak dikenali. Tanpa
    // pemetaan di errorMiddleware, error itu tidak punya statusCode dan
    // seharusnya jatuh ke 500.
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .attach("unexpected_field", Buffer.from("x"), "x.jpg")

    expect(res.status).toBe(400)
  })

  it("should allow case-only email change without false duplicate error", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .field("email", "CHANGE@example.com")

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe("change@example.com")
    expect(res.body.data.pending_email).toBeNull()
    expect(res.body.data.email_changed).toBe(false)
    expect(res.body.data.is_verified).toBe(true)
  })

  it("should keep old email active and apply new email only after verification", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${changeToken}`)
      .field("name", "Email Change User")
      .field("username", "emailchangeuser")
      .field("email", "newemail@example.com")

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe("change@example.com")
    expect(res.body.data.pending_email).toBe("newemail@example.com")
    expect(res.body.data.email_changed).toBe(true)
    expect(res.body.data.is_verified).toBe(true)

    const oldEmailLogin = await request(app).post("/api/auth/login").send({
      email: "change@example.com",
      password,
    })
    expect(oldEmailLogin.status).toBe(200)

    const newEmailLogin = await request(app).post("/api/auth/login").send({
      email: "newemail@example.com",
      password,
    })
    expect(newEmailLogin.status).toBe(401)

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${changeToken}`)
    expect(meRes.status).toBe(200)
    expect(meRes.body.data.email).toBe("change@example.com")
    expect(meRes.body.data.pending_email).toBe("newemail@example.com")

    const resendRes = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "newemail@example.com" })
    expect(resendRes.status).toBe(200)

    const verificationRecord = await VerificationCode.findOne({
      include: [
        { model: User, where: { pending_email: "newemail@example.com" } },
      ],
    })
    expect(verificationRecord).not.toBeNull()

    const wrongCodeRes = await request(app)
      .post("/api/auth/verify-email")
      .send({
        email: "newemail@example.com",
        code: "000000",
      })
    expect(wrongCodeRes.status).toBe(400)

    const verifyRes = await request(app)
      .post("/api/auth/verify-email")
      .send({
        email: "newemail@example.com",
        code: verificationRecord.code,
      })
    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.data.email).toBe("newemail@example.com")
    expect(verifyRes.body.data.pending_email).toBeNull()
    expect(verifyRes.body.data.is_verified).toBe(true)

    const oldEmailLoginAfter = await request(app).post("/api/auth/login").send({
      email: "change@example.com",
      password,
    })
    expect(oldEmailLoginAfter.status).toBe(401)

    const verifiedLogin = await request(app).post("/api/auth/login").send({
      email: "newemail@example.com",
      password,
    })
    expect(verifiedLogin.status).toBe(200)
  })
})
