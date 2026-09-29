// Regression test untuk race invalidasi cache.
//
// Bug yang diuji: satu request yang sedang membangun nilai cache (SELECT berat)
// bisa selesai SETELAH perubahan data masuk dan cache di-purge. Kalau hasil
// lamanya tetap ditulis balik ke cache, cache terisi data basi lagi selama TTL
// penuh. Gejalanya di UI persis seperti yang dilaporkan: perubahan admin "tidak
// nyangkut" — status tombol kembali ke nilai lama, harus diklik berkali-kali, atau
// baru berubah setelah beberapa detik saat TTL habis.
//
// Skenario: GET /api/projects (cache miss, query ditahan) disela di tengah oleh
// PATCH /:id/featured. Setelah keduanya selesai, GET berikutnya WAJIB dapat data
// baru.
// Cache dimatikan otomatis saat NODE_ENV=test (lihat utils/cache.js) supaya
// test lain tetap deterministik. File ini justru HANYA bermakna kalau cache
// hidup, jadi nyalakan di sini. Di-set sebelum require app apa pun.
//
// Catatan: `CACHE_IN_TEST=true npx jest` TIDAK selalu diteruskan ke worker
// jest (di shell ini variabelnya hilang), jadi menyalakannya di dalam file
// adalah cara yang andal. Nilai asli dipulihkan di afterAll supaya tidak bocor
// ke file test lain saat --runInBand.
const previousCacheInTest = process.env.CACHE_IN_TEST
process.env.CACHE_IN_TEST = "true"

const request = require("supertest")
const app = require("../server")
const { User, Category, Project } = require("../models")
const { tokenFromCookie } = require("./helpers")
const cache = require("../utils/cache")

// Guard: kalau cache diam-diam mati lagi, test ini lulus palsu. Pastikan
// benar-benar bisa storing, kalau tidak gagal cepat dengan pesan jelas.
const expectCacheWorks = async () => {
  await cache.set("__sanity__", { ok: true }, 5000)
  const value = await cache.get("__sanity__")
  await cache.del("__sanity__")
  expect(value).toEqual({ ok: true })
}

// Deferred sederhana: resolve() dipanggil dari test untuk melepas jebakan.
const deferred = () => {
  let release
  const promise = new Promise((resolve) => {
    release = resolve
  })
  return { promise, release }
}

describe("Invalidasi cache saat data berubah di tengah query", () => {
  let adminToken = ""
  let studentToken = ""
  let categoryId = null
  let projectId = null

  const listQuery = "/api/projects?page=1&limit=500"

  afterAll(() => {
    if (previousCacheInTest === undefined) delete process.env.CACHE_IN_TEST
    else process.env.CACHE_IN_TEST = previousCacheInTest
  })

  beforeAll(async () => {
    await expectCacheWorks()

    await Project.destroy({ where: {} })
    await Category.destroy({ where: {} })
    await User.destroy({ where: {} })

    const category = await Category.create({
      name: "Kategori Cache",
      slug: "kategori-cache",
      is_active: true,
    })
    categoryId = category.id

    await request(app).post("/api/auth/register").send({
      name: "Admin Cache",
      username: "admincache",
      email: "admincache@example.com",
      password: "Password123!",
      tipe: "admin",
    })
    const adminUser = await User.findOne({ where: { email: "admincache@example.com" } })
    adminUser.is_verified = true
    adminUser.role = "admin"
    await adminUser.save()
    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admincache@example.com",
      password: "Password123!",
    })
    adminToken = tokenFromCookie(adminLogin)

    const studentRegister = await request(app).post("/api/auth/register").send({
      name: "Student Cache",
      username: "studentcache",
      email: "studentcache@example.com",
      password: "Password123!",
      tipe: "mahasiswa",
      nim_nip: "2101010099",
    })
    expect(studentRegister.status).toBe(201)

    const studentUser = await User.findOne({ where: { email: "studentcache@example.com" } })
    expect(studentUser).not.toBeNull()
    studentUser.is_verified = true
    studentUser.tipe = "mahasiswa"
    studentUser.pending_tipe = null
    await studentUser.save()
    const studentLogin = await request(app).post("/api/auth/login").send({
      email: "studentcache@example.com",
      password: "Password123!",
    })
    studentToken = tokenFromCookie(studentLogin)

    // Dibuat lewat API supaya thumbnail & kolom wajib terisi, lalu dipublish
    // karena endpoint unggulan/slideshow hanya menerima karya berstatus
    // "published".
    const created = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${studentToken}`)
      .attach("thumbnail", Buffer.from("fake-image-bytes"), "thumbnail.jpg")
      .field("title", "Karya Cache")
      .field("description", "Karya untuk uji invalidasi cache")
      .field("category_id", String(categoryId))
      .field("year", "2026")
      .field("abstract", "Abstract text here...")
    expect(created.status).toBe(201)
    projectId = created.body.data.id

    const published = await request(app)
      .patch(`/api/projects/${projectId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "published" })
    expect(published.status).toBe(200)

    // Cache daftar harus kosong supaya test pertama benar-benar cache miss.
    await cache.delPrefix("projects:list:")
    await cache.del("hall:projects")
  })

  it("tidak menulis data basi ke cache saat PATCH terjadi di tengah query", async () => {
    const findAll = Project.findAll
    const gate = deferred()
    let armed = true

    // Query-nya tetap jalan normal (snapshot diambil), tapi resolusinya
    // ditahan supaya PATCH bisa masuk sebelum cache ditulis.
    Project.findAll = async function heldFindAll(...args) {
      const rows = await findAll.apply(this, args)
      if (armed) {
        armed = false
        await gate.promise
      }
      return rows
    }

    try {
      await cache.delPrefix("projects:list:")
      await cache.del("hall:projects")

      // .end() dipakai (bukan await pada objek Test) supaya request benar-benar
      // langsung dikirim; kalau tidak, request bisa menganggur sampai di-resolve.
      const inflight = new Promise((resolve, reject) => {
        request(app)
          .get(listQuery)
          .set("Authorization", `Bearer ${adminToken}`)
          .end((err, res) => (err ? reject(err) : resolve(res)))
      })
      inflight.catch(() => {})

      // Tunggu jebakan benar-benar tersentuh (batas 10 detik).
      for (let i = 0; i < 2000 && armed; i++) {
        await new Promise((r) => setTimeout(r, 5))
      }
      expect(armed).toBe(false)

      const patch = await request(app)
        .patch(`/api/projects/${projectId}/featured`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slot: 1 })
      expect(patch.status).toBe(200)
      expect(patch.body.data.featured_slot).toBe(1)

      // Lepas jebakan: build lama selesai DI SETELAH purge. Tanpa penjaga
      // epoch, hasil basi ini akan menimpa cache untuk 30 detik penuh.
      gate.release()
      await inflight

      const after = await request(app)
        .get(listQuery)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(after.status).toBe(200)
      const found = after.body.data.items.find((p) => p.id === projectId)
      expect(found).toBeDefined()
      expect(found.featured_slot).toBe(1)
    } finally {
      // Wajib: kalau assertion di atas gagal, jebakan & findAll harus tetap
      // dilepas, kalau tidak jest menggantung tanpa selesai.
      gate.release()
      Project.findAll = findAll
    }
  })

  it("hall ikut segar setelah status slideshow diubah", async () => {
    const shown = await request(app)
      .patch(`/api/projects/${projectId}/slideshow`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ visible: true })
    expect(shown.status).toBe(200)

    const hall = await request(app).get("/api/hall")
    expect(hall.status).toBe(200)

    const found = hall.body.data.projects.find((p) => p.id === projectId)
    expect(found).toBeDefined()
    expect(found.is_shown_in_slideshow).toBe(true)
  })

  it("hall ikut segar setelah karya dilepas dari unggulan", async () => {
    const res = await request(app)
      .patch(`/api/projects/${projectId}/featured`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ slot: null })
    expect(res.status).toBe(200)

    const hall = await request(app).get("/api/hall")
    expect(hall.status).toBe(200)

    const found = hall.body.data.projects.find((p) => p.id === projectId)
    expect(found.is_shown_in_slideshow).toBe(false)
  })

  it("status aktif kategori tidak basi setelah refetch", async () => {
    const before = await request(app).get("/api/categories?all=1")
    expect(before.status).toBe(200)
    expect(Array.isArray(before.body.data)).toBe(true)
    expect(before.body.data.find((c) => c.id === categoryId).is_active).toBe(true)

    const off = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_active: false })
    expect(off.status).toBe(200)

    const after = await request(app).get("/api/categories?all=1")
    const found = after.body.data.find((c) => c.id === categoryId)
    expect(found.is_active).toBe(false)

    const hall = await request(app).get("/api/hall")
    expect(hall.body.data.categories.find((c) => c.id === categoryId)).toBeUndefined()

    await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ is_active: true })
  })
})
