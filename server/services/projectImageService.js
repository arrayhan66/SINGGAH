const { ProjectImage, Project } = require("../models")
const AppError = require("../utils/AppError")

const assertCanModify = (project, user) => {
  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }
}

exports.getImages = async (projectId) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  return await ProjectImage.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addImage = async (projectId, imageUrl, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  assertCanModify(project, user)

  return await ProjectImage.create({
    image_url: imageUrl,
    project_id: projectId,
  })
}

exports.removeImage = async (projectId, imageId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  assertCanModify(project, user)

  const image = await ProjectImage.findOne({
    where: { id: imageId, project_id: projectId },
  })
  if (!image) throw new AppError("Gambar tidak ditemukan", 404)

  await image.destroy()
  return image
}
