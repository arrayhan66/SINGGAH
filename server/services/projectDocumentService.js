const { ProjectDocument, Project } = require("../models")
const AppError = require("../utils/AppError")

exports.getDocuments = async (projectId) => {
  return await ProjectDocument.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  })
}

exports.addDocument = async (projectId, data, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  return await ProjectDocument.create({
    name: data.name,
    file_url: data.file_url,
    project_id: projectId,
  })
}

exports.removeDocument = async (projectId, docId, user) => {
  const project = await Project.findByPk(projectId)
  if (!project) throw new AppError("Project tidak ditemukan", 404)

  if (user.role !== "admin" && project.user_id !== user.id) {
    throw new AppError("Akses ditolak", 403)
  }

  const doc = await ProjectDocument.findOne({
    where: { id: docId, project_id: projectId },
  })
  if (!doc) throw new AppError("Dokumen tidak ditemukan", 404)

  await doc.destroy()
  return doc
}
