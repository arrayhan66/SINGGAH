const { Op } = require("sequelize")
const { ProjectView, Project } = require("../models")
const AppError = require("../utils/AppError")
const resolveProjectId = require("../utils/resolveProjectId")

const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000

exports.addView = async (projectId, user, ipAddress) => {
  const id = await resolveProjectId(projectId)
  const project = await Project.findByPk(id)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (ipAddress) {
    const cutoff = new Date(Date.now() - DEDUP_WINDOW_MS)
    const recent = await ProjectView.findOne({
      where: {
        project_id: id,
        ip_address: ipAddress,
        created_at: { [Op.gte]: cutoff },
      },
    })
    if (recent) return recent
  }

  return await ProjectView.create({
    project_id: id,
    user_id: user ? user.id : null,
    ip_address: ipAddress || null,
  })
}

exports.getViewCount = async (projectId) => {
  const id = await resolveProjectId(projectId)
  return await ProjectView.count({ where: { project_id: id } })
}
