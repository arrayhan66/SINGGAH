const request = require("supertest")
const app = require("../server")
const {
  Project,
  ProjectDocument,
  ProjectImage,
  ProjectLink,
  ProjectMember,
  ProjectVideo,
} = require("../models")
const { createUser, tokenFor, createCategory, createProject } = require("./helpers")

describe("Project Sub-Resource: documents, images, links, members, videos", () => {
  let admin
  let owner
  let stranger
  let adminToken = ""
  let ownerToken = ""
  let strangerToken = ""
  let category
  let ownedProject
  let otherProject
  let sharedProject

  beforeAll(async () => {
    await Project.destroy({ where: {} })

    admin = await createUser({
      name: "Admin Aset",
      username: "adminaset",
      email: "adminaset@example.com",
      role: "admin",
      tipe: "admin",
    })
    owner = await createUser({
      name: "Pemilik Aset",
      username: "pemilikaset",
      email: "pemilikaset@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010021",
    })
    stranger = await createUser({
      name: "Bukan Pemilik",
      username: "bukanpemilik",
      email: "bukanpemilik@example.com",
      tipe: "mahasiswa",
      nim_nip: "2101010022",
    })

    adminToken = tokenFor(admin)
    ownerToken = tokenFor(owner)
    strangerToken = tokenFor(stranger)

    category = await createCategory({ name: "Kategori Aset" })
    ownedProject = await createProject(owner, category, { title: "Karya Milik Sendiri" })
    // Dimiliki admin, dipakai untuk membuktikan user biasa tidak bisa menyentuhnya.
    otherProject = await createProject(admin, category, { title: "Karya Milik Admin" })
    // Dimiliki user biasa, dipakai untuk membuktikan admin boleh melewati cek kepemilikan.
    sharedProject = await createProject(owner, category, { title: "Karya Bersama" })
  })

  describe("Dokumen", () => {
    let docId = null

    it("should reject adding a document without authentication", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/documents`)
        .send({ name: "Laporan", file_url: "https://example.com/laporan.pdf" })

      expect(res.status).toBe(401)
    })

    it("should reject adding a document to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${otherProject.id}/documents`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ name: "Gagur", file_url: "https://example.com/gagur.pdf" })

      expect(res.status).toBe(403)
    })

    it("should return 404 when the project does not exist", async () => {
      const res = await request(app)
        .post("/api/projects/999999/documents")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Tidak Ada", file_url: "https://example.com/x.pdf" })

      expect(res.status).toBe(404)
    })

    it("should let the owner add a document", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/documents`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Laporan Akhir", file_url: "https://example.com/laporan.pdf" })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty("name", "Laporan Akhir")
      expect(res.body.data).toHaveProperty("file_url", "https://example.com/laporan.pdf")
      docId = res.body.data.id
    })

    it("should let an admin add a document to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${sharedProject.id}/documents`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Dokumen Admin", file_url: "https://example.com/admin.pdf" })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty("name", "Dokumen Admin")
    })

    it("should list documents publicly", async () => {
      const res = await request(app).get(`/api/projects/${ownedProject.id}/documents`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toHaveProperty("name", "Laporan Akhir")
    })

    it("should return 404 when deleting a document that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/documents/999999`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete a document", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/documents/${docId}`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await ProjectDocument.findByPk(docId)).toBeNull()
    })
  })

  describe("Gambar", () => {
    let imageId = null

    it("should reject uploading without a file", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/images`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/Gambar wajib diupload/i)
    })

    it("should reject uploading without authentication", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/images`)
        .attach("image", Buffer.from("fake-image-bytes"), "gambar.jpg")

      expect(res.status).toBe(401)
    })

    it("should reject uploading to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${otherProject.id}/images`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .attach("image", Buffer.from("fake-image-bytes"), "gambar.jpg")

      expect(res.status).toBe(403)
    })

    it("should return 404 when listing images of a missing project", async () => {
      const res = await request(app).get("/api/projects/999999/images")
      expect(res.status).toBe(404)
    })

    it("should let the owner upload an image", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/images`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .attach("image", Buffer.from("fake-image-bytes"), "gambar.jpg")

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.image_url).toMatch(/^https:\/\/res\.cloudinary\.com\/test\//)
      imageId = res.body.data.id
    })

    it("should list images publicly", async () => {
      const res = await request(app).get(`/api/projects/${ownedProject.id}/images`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toHaveProperty("id", imageId)
    })

    it("should return 404 when deleting an image that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/images/999999`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete an image", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/images/${imageId}`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await ProjectImage.findByPk(imageId)).toBeNull()
    })
  })

  describe("Link", () => {
    let linkId = null

    it("should reject adding a link without authentication", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/links`)
        .send({ label: "Repo", url: "https://github.com/singgah" })

      expect(res.status).toBe(401)
    })

    it("should reject adding a link to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${otherProject.id}/links`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ label: "Gagur", url: "https://github.com/gagur" })

      expect(res.status).toBe(403)
    })

    it("should let the owner add a link", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/links`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ label: "Repository", url: "https://github.com/singgah/karya" })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty("label", "Repository")
      expect(res.body.data).toHaveProperty("url", "https://github.com/singgah/karya")
      linkId = res.body.data.id
    })

    it("should list links publicly", async () => {
      const res = await request(app).get(`/api/projects/${ownedProject.id}/links`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toHaveProperty("label", "Repository")
    })

    it("should return 404 when deleting a link that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/links/999999`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete a link", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/links/${linkId}`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await ProjectLink.findByPk(linkId)).toBeNull()
    })
  })

  describe("Anggota", () => {
    let memberId = null

    it("should reject adding a member without authentication", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/members`)
        .send({ name: "Anggota", role: "Developer" })

      expect(res.status).toBe(401)
    })

    it("should reject adding a member to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${otherProject.id}/members`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ name: "Gagur", role: "Developer" })

      expect(res.status).toBe(403)
    })

    it("should let the owner add a member", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Siti Aminah", role: "Frontend" })

      expect(res.status).toBe(201)
      expect(res.body.data).toHaveProperty("name", "Siti Aminah")
      expect(res.body.data).toHaveProperty("role", "Frontend")
      memberId = res.body.data.id
    })

    it("should default role to null when omitted", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Tanpa Role" })

      expect(res.status).toBe(201)
      expect(res.body.data.role).toBeNull()
    })

    it("should list members publicly", async () => {
      const res = await request(app).get(`/api/projects/${ownedProject.id}/members`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.data.map((m) => m.name)).toEqual(
        expect.arrayContaining(["Siti Aminah", "Tanpa Role"]),
      )
    })

    it("should return 404 when deleting a member that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/members/999999`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete a member", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/members/${memberId}`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await ProjectMember.findByPk(memberId)).toBeNull()
    })
  })

  describe("Video", () => {
    let videoId = null

    it("should reject adding a video without authentication", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/videos`)
        .send({ video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })

      expect(res.status).toBe(401)
    })

    it("should reject adding a video to another user's project", async () => {
      const res = await request(app)
        .post(`/api/projects/${otherProject.id}/videos`)
        .set("Authorization", `Bearer ${strangerToken}`)
        .send({ video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })

      expect(res.status).toBe(403)
    })

    it("should convert a youtube watch url into an embed url", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/videos`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })

      expect(res.status).toBe(201)
      expect(res.body.data.video_url).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ")
      videoId = res.body.data.id
    })

    it("should keep a non-youtube url as it is", async () => {
      const res = await request(app)
        .post(`/api/projects/${ownedProject.id}/videos`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ video_url: "https://cdn.example.com/demo.mp4" })

      expect(res.status).toBe(201)
      expect(res.body.data.video_url).toBe("https://cdn.example.com/demo.mp4")
    })

    it("should list videos publicly", async () => {
      const res = await request(app).get(`/api/projects/${ownedProject.id}/videos`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
    })

    it("should return 404 when deleting a video that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/videos/999999`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(404)
    })

    it("should let the owner delete a video", async () => {
      const res = await request(app)
        .delete(`/api/projects/${ownedProject.id}/videos/${videoId}`)
        .set("Authorization", `Bearer ${ownerToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(await ProjectVideo.findByPk(videoId)).toBeNull()
    })
  })

  describe("Sub-resource milik project lain tetap utuh setelah percobaan gagal", () => {
    it("tidak boleh ada data yang bocor ke project orang lain", async () => {
      const docs = await ProjectDocument.findAll({ where: { project_id: otherProject.id } })
      const images = await ProjectImage.findAll({ where: { project_id: otherProject.id } })
      const links = await ProjectLink.findAll({ where: { project_id: otherProject.id } })
      const members = await ProjectMember.findAll({ where: { project_id: otherProject.id } })
      const videos = await ProjectVideo.findAll({ where: { project_id: otherProject.id } })

      expect(docs).toHaveLength(0)
      expect(images).toHaveLength(0)
      expect(links).toHaveLength(0)
      expect(members).toHaveLength(0)
      expect(videos).toHaveLength(0)
    })

    it("dokumen yang ditambahkan admin tetap menempel di project yang benar", async () => {
      const docs = await ProjectDocument.findAll({ where: { project_id: sharedProject.id } })
      expect(docs).toHaveLength(1)
      expect(docs[0].name).toBe("Dokumen Admin")
    })
  })
})
