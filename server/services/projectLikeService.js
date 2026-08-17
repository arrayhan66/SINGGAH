const { ProjectLike, Project, User, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const resolveProjectId = require("../utils/resolveProjectId")
const { createNotification } = require("./notificationService")
const { logActivity } = require("./activityLogService")

exports.toggleLike = async (projectId, user) => {
  const id = await resolveProjectId(projectId)
  const project = await Project.findByPk(id)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  const existing = await ProjectLike.findOne({
    where: { project_id: id, user_id: user.id },
  })

  if (existing) {
    await existing.destroy()
    const likesCount = await ProjectLike.count({ where: { project_id: id } })
    return { liked: false, likesCount }
  }

  await sequelize.transaction(async (t) => {
    await ProjectLike.create(
      {
        project_id: id,
        user_id: user.id,
      },
      { transaction: t },
    )

    if (project.user_id !== user.id) {
      await createNotification(
        {
          user_id: project.user_id,
          type: "like",
          title: "Disukai",
          message: `${user.name} menyukai project Anda: "${project.title}"`,
          reference_type: "project",
          reference_id: project.id,
        },
        { transaction: t },
      )
    }
  })

  await logActivity({
    userId: user.id,
    action: "project_liked",
    targetType: "project",
    targetId: id,
    description: `${user.name} menyukai project "${project.title}"`,
  })

  const likesCount = await ProjectLike.count({ where: { project_id: id } })

  return { liked: true, likesCount }
}

exports.getLikeCount = async (projectId) => {
  const id = await resolveProjectId(projectId)
  return await ProjectLike.count({ where: { project_id: id } })
}

exports.hasUserLiked = async (projectId, userId) => {
  if (!userId) return false
  const like = await ProjectLike.findOne({
    where: { project_id: projectId, user_id: userId },
  })
  return !!like
}
