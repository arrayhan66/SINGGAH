const { ProjectLink, Project } = require("../models")
const AppError = require("../utils/AppError")

exports.getLinks = async (projectId) => {
  return await ProjectLink.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addLink = async (projectId, data, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  return await ProjectLink.create({
    label: data.label,
    url: data.url,
    project_id: projectId,
  })
}

exports.removeLink = async (projectId, linkId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const link = await ProjectLink.findOne({
    where: { id: linkId, project_id: projectId },
  })
  if (!link) throw new AppError("Link tidak ditemukan", 404)

  await link.destroy()
  return link
}
