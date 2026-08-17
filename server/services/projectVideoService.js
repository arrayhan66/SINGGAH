const { ProjectVideo, Project } = require("../models")
const AppError = require("../utils/AppError")
const { toEmbedUrl } = require("../utils/videoUrl")

exports.getVideos = async (projectId) => {
  return await ProjectVideo.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addVideo = async (projectId, data, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  return await ProjectVideo.create({
    video_url: toEmbedUrl(data.video_url),
    project_id: projectId,
  })
}

exports.removeVideo = async (projectId, videoId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const video = await ProjectVideo.findOne({
    where: { id: videoId, project_id: projectId },
  })
  if (!video) throw new AppError("Video tidak ditemukan", 404)

  await video.destroy()
  return video
}
