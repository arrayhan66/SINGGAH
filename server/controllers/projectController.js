const projectService = require("../services/projectService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const { ProjectImage, ProjectDocument } = require("../models")
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

const removeAssets = async (rows, Model, urlField) => {
  for (const item of rows) {
    const url = typeof item === "string" ? item : item[urlField]
    const id = typeof item === "string" ? null : item.id

    if (url) {
      const publicId = getPublicIdFromUrl(url)
      if (publicId) {
        await deleteImage(publicId).catch(() => {})
      }
    }

    if (id) {
      await Model.destroy({ where: { id } })
    }
  }
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

exports.updateProject = asyncHandler(async (req, res) => {
  const existingProject = await projectService.getProjectById(req.params.id)

  if (req.user.role !== "admin" && existingProject.user_id !== req.user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  if (req.files && req.files.thumbnail) {
    const oldPublicId = getPublicIdFromUrl(existingProject.thumbnail)

    if (oldPublicId) {
      await deleteImage(oldPublicId)
    }

    const result = await uploadImage(
      req.files.thumbnail[0].buffer,
      "singgah/thumbnails",
    )

    req.body.thumbnail = result.secure_url
  }

  if (req.files && req.files.images && req.files.images.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.images.map((file) =>
        uploadImage(file.buffer, "singgah/projects"),
      ),
    )

    await ProjectImage.bulkCreate(
      uploadedImages.map((result) => ({
        image_url: result.secure_url,
        project_id: existingProject.id,
      })),
    )
  }

  if (req.files && req.files.documents && req.files.documents.length > 0) {
    const uploadedDocuments = await Promise.all(
      req.files.documents.map((file) =>
        uploadImage(file.buffer, "singgah/documents", {
          resource_type: "raw",
        }),
      ),
    )

    await ProjectDocument.bulkCreate(
      uploadedDocuments.map((result, index) => ({
        name: req.files.documents[index].originalname,
        file_url: result.secure_url,
        project_id: existingProject.id,
      })),
    )
  }

  const removedImages = parseRemoved(req.body.removedImages, "Gambar")

  if (removedImages.length > 0) {
    await removeAssets(removedImages, ProjectImage, "image_url")
  }

  const removedDocuments = parseRemoved(
    req.body.removedDocuments,
    "Dokumen",
  )

  if (removedDocuments.length > 0) {
    await removeAssets(removedDocuments, ProjectDocument, "file_url")
  }

  const project = await projectService.updateProject(
    req.params.id,
    req.body,
    req.user,
  )

  success(res, project, "Project berhasil diperbarui")
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
