const { Bookmark, Project, Category, User, ProjectImage } = require("../models")
const AppError = require("../utils/AppError")
const resolveProjectId = require("../utils/resolveProjectId")

exports.toggleBookmark = async (projectId, user) => {
  const id = await resolveProjectId(projectId)
  const project = await Project.findByPk(id)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  const existing = await Bookmark.findOne({
    where: { project_id: id, user_id: user.id },
  })

  if (existing) {
    await existing.destroy()
    return { bookmarked: false }
  }

  await Bookmark.create({
    project_id: id,
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
    include: [
      {
        model: Project,
        include: [
          {
            model: Category,
            attributes: ["id", "name", "slug"],
          },
          {
            model: User,
            attributes: ["id", "name", "username", "avatar", "tipe"],
          },
          {
            model: ProjectImage,
            as: "images",
            attributes: ["id", "image_url"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  })
}
