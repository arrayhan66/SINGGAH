const { ProjectImage, Project } = require("../models")
const AppError = require("../utils/AppError")

exports.getImages = async (projectId) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  return await ProjectImage.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addImage = async (projectId, imageUrl) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  return await ProjectImage.create({
    image_url: imageUrl,
    project_id: projectId,
  })
}

exports.removeImage = async (projectId, imageId) => {
  const image = await ProjectImage.findOne({
    where: { id: imageId, project_id: projectId },
  })
  if (!image) throw new AppError("Gambar tidak ditemukan", 404)

  await image.destroy()
  return image
}
