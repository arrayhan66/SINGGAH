const { ProjectView, Project } = require("../models")

exports.addView = async (projectId, user, ipAddress) => {
  const project = await Project.findByPk(projectId)
  if (!project) return null

  return await ProjectView.create({
    project_id: projectId,
    user_id: user ? user.id : null,
    ip_address: ipAddress || null,
  })
}

exports.getViewCount = async (projectId) => {
  return await ProjectView.count({ where: { project_id: projectId } })
}
