const projectService = require("../services/projectService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const AppError = require("../utils/AppError")
const { logActivity } = require("../services/activityLogService")

const parseRemoved = (value, label) => {
  if (value === undefined || value === null || value === "") return []

  if (Array.isArray(value)) return value

  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      throw new AppError(`${label} tidak valid`, 400)
    }
  }

  throw new AppError(`${label} tidak valid`, 400)
}

exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(
    req.query,
    req.user?.id || null,
    req.user?.role || null,
  )

  success(res, projects)
})

exports.getMyProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getMyProjects(req.user.id)

  success(res, projects)
})

exports.getPendingProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getPendingProjects()

  success(res, projects)
})

exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(
    req.params.id,
    req.user?.id || null,
    req.user?.role || null,
    req.tokenInvalid,
  )

  success(res, project)
})

exports.createProject = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.thumbnail) {
    throw new AppError("Thumbnail wajib diupload", 400)
  }

  const thumbnailResult = await uploadImage(
    req.files.thumbnail[0].buffer,
    "singgah/thumbnails",
  )

  req.body.thumbnail = thumbnailResult.secure_url

  let imageUrls = []

  if (req.files.images && req.files.images.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.images.map((file) =>
        uploadImage(file.buffer, "singgah/projects"),
      ),
    )

    imageUrls = uploadedImages.map((result) => result.secure_url)
  }

  let documentUrls = []

  if (req.files.documents && req.files.documents.length > 0) {
    const uploadedDocuments = await Promise.all(
      req.files.documents.map((file) =>
        uploadImage(file.buffer, "singgah/documents", {
          resource_type: "raw",
        }),
      ),
    )

    documentUrls = uploadedDocuments.map((result, index) => ({
      name: req.files.documents[index].originalname,
      file_url: result.secure_url,
    }))
  }

  const project = await projectService.createProject(
    req.body,
    req.user,
    imageUrls,
    documentUrls,
  )

  await logActivity({
    userId: req.user.id,
    action: "project_created",
    targetType: "project",
    targetId: project.id,
    description: `${req.user.name} mengunggah project "${project.title}"`,
  })

  success(res, project, "Project berhasil dibuat", 201)
})

exports.updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectStatus(
    req.params.id,
    req.body.status,
    req.body.reason,
  )

  const actionMap = {
    published: "project_approved",
    rejected: "project_rejected",
    pending: "project_pending",
  }

  await logActivity({
    userId: req.user.id,
    action: actionMap[req.body.status] || "project_status_updated",
    targetType: "project",
    targetId: project.id,
    description: `${req.user.name} mengubah status project "${project.title}" menjadi ${req.body.status}`,
  })

  success(res, project, "Status project berhasil diperbarui")
})

exports.setProjectFeatured = asyncHandler(async (req, res) => {
  const project = await projectService.setProjectFeatured(
    req.params.id,
    req.body.slot ?? null,
  )

  const description =
    req.body.slot === null || req.body.slot === undefined
      ? `${req.user.name} melepas project "${project.title}" dari karya unggulan`
      : `${req.user.name} menetapkan project "${project.title}" sebagai karya unggulan slot ${req.body.slot}`

  await logActivity({
    userId: req.user.id,
    action: "project_featured_updated",
    targetType: "project",
    targetId: project.id,
    description,
  })

  success(res, project, "Slot karya unggulan berhasil diperbarui")
})

exports.setProjectSlideshow = asyncHandler(async (req, res) => {
  const project = await projectService.setProjectSlideshow(
    req.params.id,
    req.body.visible,
  )

  const description = project.is_shown_in_slideshow
    ? `${req.user.name} menampilkan project "${project.title}" di slideshow beranda`
    : `${req.user.name} menyembunyikan project "${project.title}" dari slideshow beranda`

  await logActivity({
    userId: req.user.id,
    action: "project_slideshow_updated",
    targetType: "project",
    targetId: project.id,
    description,
  })

  success(
    res,
    project,
    project.is_shown_in_slideshow
      ? "Karya kini tampil di slideshow beranda"
      : "Karya tidak lagi tampil di slideshow beranda",
  )
})

exports.updateProject = asyncHandler(async (req, res) => {
  const existingProject = await projectService.getProjectById(
    req.params.id,
    req.user.id,
    req.user.role,
  )

  if (req.user.role !== "admin" && existingProject.user_id !== req.user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  // File hasil upload dikumpulkan ke `fileOps`, TIDAK langsung ditulis ke
  // `projects`. Alasannya: untuk mahasiswa, file ini nanti melekat ke revisi
  // yang menunggu verifikasi — karya yang sudah tayang tidak boleh tersentuh
  // sebelum admin menyetujui. Penulisan ke database cukup di satu tempat,
  // yaitu applyProjectWrites() di service.
  const fileOps = {
    images: [],
    documents: [],
    removedImages: parseRemoved(req.body.removedImages, "Gambar"),
    removedDocuments: parseRemoved(req.body.removedDocuments, "Dokumen"),
  }

  if (req.files && req.files.thumbnail) {
    const result = await uploadImage(
      req.files.thumbnail[0].buffer,
      "singgah/thumbnails",
    )

    fileOps.thumbnailUrl = result.secure_url
  }

  if (req.files && req.files.images && req.files.images.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.images.map((file) =>
        uploadImage(file.buffer, "singgah/projects"),
      ),
    )

    fileOps.images = uploadedImages.map((result) => result.secure_url)
  }

  if (req.files && req.files.documents && req.files.documents.length > 0) {
    const uploadedDocuments = await Promise.all(
      req.files.documents.map((file) =>
        uploadImage(file.buffer, "singgah/documents", {
          resource_type: "raw",
        }),
      ),
    )

    fileOps.documents = uploadedDocuments.map((result, index) => ({
      name: req.files.documents[index].originalname,
      file_url: result.secure_url,
    }))
  }

  const result = await projectService.updateProject(
    req.params.id,
    req.body,
    req.user,
    fileOps,
  )

  // Mahasiswa: perubahan disimpan sebagai revisi, karya belum berubah.
  if (result && result.pendingReview) {
    await logActivity({
      userId: req.user.id,
      action: "project_revision_submitted",
      targetType: "project",
      targetId: existingProject.id,
      description: `${req.user.name} mengajukan perubahan pada karya "${existingProject.title}" untuk diverifikasi admin`,
    })

    return success(
      res,
      result,
      "Perubahan karya diajukan dan menunggu verifikasi admin",
      202,
    )
  }

  success(res, result, "Project berhasil diperbarui")
})

exports.getPendingRevisions = asyncHandler(async (req, res) => {
  const data = await projectService.getPendingRevisions(req.query)

  success(res, data, "Daftar revisi berhasil dimuat")
})

exports.getRevisionById = asyncHandler(async (req, res) => {
  const data = await projectService.getRevisionById(req.params.id, req.user)

  success(res, data, "Revisi berhasil dimuat")
})

exports.getProjectPendingRevision = asyncHandler(async (req, res) => {
  const revision = await projectService.getPendingRevisionByProject(
    req.params.id,
    req.user,
  )

  success(res, revision, "Status revisi berhasil dimuat")
})

exports.cancelRevision = asyncHandler(async (req, res) => {
  const revision = await projectService.cancelRevision(req.params.id, req.user)

  await logActivity({
    userId: req.user.id,
    action: "project_revision_cancelled",
    targetType: "project",
    targetId: revision.project_id,
    description: `${req.user.name} membatalkan pengajuan perubahan karya`,
  })

  success(res, revision, "Pengajuan perubahan dibatalkan")
})

exports.approveRevision = asyncHandler(async (req, res) => {
  const project = await projectService.approveRevision(
    req.params.id,
    req.body.note,
    req.user,
  )

  await logActivity({
    userId: req.user.id,
    action: "project_revision_approved",
    targetType: "project",
    targetId: project.id,
    description: `${req.user.name} menyetujui perubahan karya "${project.title}"`,
  })

  success(res, project, "Perubahan karya disetujui dan sudah tayang")
})

exports.rejectRevision = asyncHandler(async (req, res) => {
  const revision = await projectService.rejectRevision(
    req.params.id,
    req.body.reason,
    req.user,
  )

  await logActivity({
    userId: req.user.id,
    action: "project_revision_rejected",
    targetType: "project",
    targetId: revision.project_id,
    description: `${req.user.name} menolak perubahan karya${req.body.reason ? `: ${req.body.reason}` : ""}`,
  })

  success(res, revision, "Perubahan karya ditolak")
})

exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await projectService.deleteProject(req.params.id, req.user)

  await logActivity({
    userId: req.user.id,
    action: "project_deleted",
    targetType: "project",
    targetId: project.id,
    description: `${req.user.name} menghapus project "${project.title}"`,
  })

  const thumbnailPublicId = getPublicIdFromUrl(project.thumbnail)

  if (thumbnailPublicId) {
    await deleteImage(thumbnailPublicId)
  }

  if (project.images && project.images.length > 0) {
    await Promise.all(
      project.images.map((image) => {
        const publicId = getPublicIdFromUrl(image.image_url)

        if (publicId) {
          return deleteImage(publicId)
        }
      }),
    )
  }

  success(res, null, "Project berhasil dihapus")
})
