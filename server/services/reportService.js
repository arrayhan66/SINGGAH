const { Project, User, ProjectView, ProjectLike, sequelize } = require("../models")
const { Op } = require("sequelize")

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

exports.getReports = async (query = {}) => {
  const year = parseInt(query.year) || new Date().getFullYear()

  const yearStart = new Date(Date.UTC(year, 0, 1))
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1))
  const monthStart = new Date(Date.UTC(year, new Date().getMonth(), 1))

  const projects = await Project.findAll({
    where: {
      created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd },
    },
    attributes: [
      "id",
      "created_at",
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM project_likes WHERE project_likes.project_id = Project.id)",
        ),
        "likesCount",
      ],
      [
        sequelize.literal(
          "(SELECT COUNT(*) FROM project_views WHERE project_views.project_id = Project.id)",
        ),
        "viewsCount",
      ],
    ],
    raw: true,
  })

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    monthLabel: MONTHS[i],
    projects: 0,
    likes: 0,
    visitors: 0,
  }))

  projects.forEach((project) => {
    const monthIndex = new Date(project.created_at).getUTCMonth()

    if (monthly[monthIndex]) {
      monthly[monthIndex].projects += 1
      monthly[monthIndex].likes += project.likesCount || 0
      monthly[monthIndex].visitors += project.viewsCount || 0
    }
  })

  const [totalUser, totalProject, totalVisitors, totalLikes, newProjectsThisMonth] =
    await Promise.all([
      User.count(),
      Project.count(),
      ProjectView.count(),
      ProjectLike.count(),
      Project.count({
        where: { created_at: { [Op.gte]: monthStart } },
      }),
    ])

  return {
    year,
    monthly,
    stats: {
      totalUser,
      totalProject,
      totalVisitors,
      totalLikes,
    },
    summary: {
      avgProjects: Math.round(totalProject / 12),
      avgVisitors: Math.round(totalVisitors / 12),
      activeUsers: totalUser,
      newProjectsThisMonth,
    },
  }
}
