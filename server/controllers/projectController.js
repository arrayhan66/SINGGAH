const projectService = require("../services/projectService")
const asyncHandler = require("../utils/asyncHandler")
const { success } = require("../utils/response")
const {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl,
} = require("../utils/uploadToCloudinary")
const AppError = require("../utils/AppError")

exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getProjects(req.query)

  success(res, projects)
})

exports.getPendingProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.getPendingProjects()

  success(res, projects)
})

exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id)

  success(res, project)
})

exports.createProject = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.thumbnail) {
    throw new AppError("Thumbnail wajib diupload", 400)
  }

  const thumbnailResult = await uploadImage(
    req.files.thumbnail[0].buffer,
    "pamerit/thumbnails",
  )

  req.body.thumbnail = thumbnailResult.secure_url

  let imageUrls = []

  if (req.files.images && req.files.images.length > 0) {
    const uploadedImages = await Promise.all(
      req.files.images.map((file) =>
        uploadImage(file.buffer, "pamerit/projects"),
      ),
    )

    imageUrls = uploadedImages.map((result) => result.secure_url)
  }

  const project = await projectService.createProject(
    req.body,
    req.user,
    imageUrls,
  )

  success(res, project, "Project berhasil dibuat", 201)
})

exports.updateProjectStatus = asyncHandler(async (req, res) => {
  const project = await projectService.updateProjectStatus(
    req.params.id,
    req.body.status,
  )

  success(res, project, "Status project berhasil diperbarui")
})

exports.updateProject = asyncHandler(async (req, res) => {
  const existingProject = await projectService.getProjectById(req.params.id)

  if (req.files && req.files.thumbnail) {
    const oldPublicId = getPublicIdFromUrl(existingProject.thumbnail)

    if (oldPublicId) {
      await deleteImage(oldPublicId)
    }

    const result = await uploadImage(
      req.files.thumbnail[0].buffer,
      "pamerit/thumbnails",
    )

    req.body.thumbnail = result.secure_url
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
