const { Project } = require("../models")
const AppError = require("./AppError")

const resolveProjectId = async (value) => {
  const raw = String(value ?? "")

  if (/^\d+$/.test(raw)) {
    return Number(raw)
  }

  const project = await Project.findOne({ where: { slug: raw } })
  if (!project) {
    throw new AppError("Project tidak ditemukan", 404)
  }

  return project.id
}

module.exports = resolveProjectId
