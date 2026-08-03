const { Bookmark, Project } = require("../models")
const AppError = require("../utils/AppError")

exports.toggleBookmark = async (projectId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  const existing = await Bookmark.findOne({
    where: { project_id: projectId, user_id: user.id },
  })

  if (existing) {
    await existing.destroy()
    return { bookmarked: false }
  }

  await Bookmark.create({
    project_id: projectId,
    user_id: user.id,
  })
  return { bookmarked: true }
}

exports.hasUserBookmarked = async (projectId, userId) => {
  if (!userId) return false
  const bookmark = await Bookmark.findOne({
    where: { project_id: projectId, user_id: userId },
  })
  return !!bookmark
}

exports.getUserBookmarks = async (userId) => {
  return await Bookmark.findAll({
    where: { user_id: userId },
    include: [{ model: Project }],
    order: [["created_at", "DESC"]],
  })
}
