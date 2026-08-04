const { ProjectLike, Project, User, sequelize } = require("../models")
const AppError = require("../utils/AppError")
const { createNotification } = require("./notificationService")
const { logActivity } = require("./activityLogService")

exports.toggleLike = async (projectId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  const existing = await ProjectLike.findOne({
    where: { project_id: projectId, user_id: user.id },
  })

  if (existing) {
    await existing.destroy()
    return { liked: false }
  }

  await sequelize.transaction(async (t) => {
    await ProjectLike.create(
      {
        project_id: projectId,
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
    targetId: projectId,
    description: `${user.name} menyukai project "${project.title}"`,
  })

  if (project.user_id !== user.id) {
    await createNotification({
      user_id: project.user_id,
      type: "like",
      title: "Disukai",
      message: `${user.name} menyukai project Anda: "${project.title}"`,
      reference_type: "project",
      reference_id: project.id,
    })
  }

  return { liked: true }
}

exports.getLikeCount = async (projectId) => {
  return await ProjectLike.count({ where: { project_id: projectId } })
}

exports.hasUserLiked = async (projectId, userId) => {
  if (!userId) return false
  const like = await ProjectLike.findOne({
    where: { project_id: projectId, user_id: userId },
  })
  return !!like
}
