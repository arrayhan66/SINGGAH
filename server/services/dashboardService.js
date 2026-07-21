const { Project, News, User } = require("../models")

exports.getDashboard = async () => {
  const [
    totalProject,
    pendingProject,
    publishedProject,
    rejectedProject,
    totalNews,
    totalUser,
    pendingProjects,
  ] = await Promise.all([
    Project.count(),
    Project.count({ where: { status: "pending" } }),
    Project.count({ where: { status: "published" } }),
    Project.count({ where: { status: "rejected" } }),
    News.count(),
    User.count(),
    Project.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 5,
    }),
  ])

  return {
    stats: {
      totalProject,
      pendingProject,
      publishedProject,
      rejectedProject,
      totalNews,
      totalUser,
    },
    pendingProjects,
  }
}
