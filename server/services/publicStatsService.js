const { Project, Category, User } = require("../models")

exports.getPublicStats = async () => {
  const [totalProject, totalCategory, totalUser] = await Promise.all([
    Project.count({ where: { status: "published" } }),
    Category.count(),
    User.count(),
  ])

  return {
    totalProject,
    totalCategory,
    totalUser,
  }
}
