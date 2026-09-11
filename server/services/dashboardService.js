const { Project, News, User } = require("../models")
const { Op } = require("sequelize")

exports.getDashboard = async () => {
  const now = new Date()
  const year = now.getFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1))

  const [
    totalProject,
    pendingProject,
    publishedProject,
    rejectedProject,
    totalNews,
    totalUser,
    pendingProjects,
    projects,
    news,
    users,
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
    Project.findAll({
      where: { created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd } },
      attributes: ["status", "created_at"],
      raw: true,
    }),
    News.findAll({
      where: { created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd } },
      attributes: ["created_at"],
      raw: true,
    }),
    User.findAll({
      where: { created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd } },
      attributes: ["created_at"],
      raw: true,
    }),
  ])

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    projects: 0,
    news: 0,
    users: 0,
    pending: 0,
  }))

  projects.forEach((project) => {
    const monthIndex = new Date(project.created_at).getUTCMonth()
    if (monthly[monthIndex]) {
      monthly[monthIndex].projects += 1
      if (project.status === "pending") monthly[monthIndex].pending += 1
    }
  })

  news.forEach((item) => {
    const monthIndex = new Date(item.created_at).getUTCMonth()
    if (monthly[monthIndex]) {
      monthly[monthIndex].news += 1
    }
  })

  users.forEach((user) => {
    const monthIndex = new Date(user.created_at).getUTCMonth()
    if (monthly[monthIndex]) {
      monthly[monthIndex].users += 1
    }
  })

  return {
    year,
    monthly,
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