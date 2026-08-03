const { ProjectMember, Project } = require("../models")
const AppError = require("../utils/AppError")

exports.getMembers = async (projectId) => {
  return await ProjectMember.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addMember = async (projectId, data, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  return await ProjectMember.create({
    name: data.name,
    role: data.role || null,
    project_id: projectId,
  })
}

exports.removeMember = async (projectId, memberId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const member = await ProjectMember.findOne({
    where: { id: memberId, project_id: projectId },
  })
  if (!member) throw new AppError("Anggota tidak ditemukan", 404)

  await member.destroy()
  return member
}
