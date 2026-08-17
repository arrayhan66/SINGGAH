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
  const now = new Date()
  const actualYear = now.getFullYear()
  const actualMonth = now.getMonth()

  const yearStart = new Date(Date.UTC(year, 0, 1))
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1))
  const actualMonthStart = new Date(Date.UTC(actualYear, actualMonth, 1))

  const [projects, views, usersInYear] = await Promise.all([
    Project.findAll({
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
      ],
      raw: true,
    }),
    ProjectView.findAll({
      where: {
        created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd },
      },
      attributes: ["created_at"],
      raw: true,
    }),
    User.findAll({
      where: {
        created_at: { [Op.gte]: yearStart, [Op.lt]: yearEnd },
      },
      attributes: ["created_at"],
      raw: true,
    }),
  ])

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    monthLabel: MONTHS[i],
    projects: 0,
    likes: 0,
    visitors: 0,
    users: 0,
  }))

  projects.forEach((project) => {
    const monthIndex = new Date(project.created_at).getUTCMonth()

    if (monthly[monthIndex]) {
      monthly[monthIndex].projects += 1
      monthly[monthIndex].likes += project.likesCount || 0
    }
  })

  views.forEach((view) => {
    const monthIndex = new Date(view.created_at).getUTCMonth()
    if (monthly[monthIndex]) {
      monthly[monthIndex].visitors += 1
    }
  })

  usersInYear.forEach((u) => {
    const monthIndex = new Date(u.created_at).getUTCMonth()
    if (monthly[monthIndex]) {
      monthly[monthIndex].users += 1
    }
  })

  const monthlyProjectsTotal = monthly.reduce((sum, m) => sum + m.projects, 0)
  const monthlyVisitorsTotal = monthly.reduce((sum, m) => sum + m.visitors, 0)
  const monthlyLikesTotal = monthly.reduce((sum, m) => sum + m.likes, 0)

  const [totalUser, newProjectsThisMonth] = await Promise.all([
    User.count(),
    Project.count({
      where: { created_at: { [Op.gte]: actualMonthStart } },
    }),
  ])

  const [activeResult] = await sequelize.query(
    `SELECT COUNT(DISTINCT user_id) AS count FROM (
       SELECT user_id FROM projects WHERE created_at >= :monthStart AND user_id IS NOT NULL
       UNION
       SELECT user_id FROM project_likes WHERE created_at >= :monthStart
       UNION
       SELECT user_id FROM project_views WHERE created_at >= :monthStart AND user_id IS NOT NULL
     ) AS active_users`,
    { replacements: { monthStart: actualMonthStart }, type: sequelize.QueryTypes.SELECT },
  )
  const activeUsers = Number(activeResult?.count) || 0

  const round1 = (v) => Math.round(v * 10) / 10

  return {
    year,
    monthly,
    stats: {
      totalUser,
      totalProject: monthlyProjectsTotal,
      totalVisitors: monthlyVisitorsTotal,
      totalLikes: monthlyLikesTotal,
    },
    summary: {
      avgProjects: round1(monthlyProjectsTotal / 12),
      avgVisitors: round1(monthlyVisitorsTotal / 12),
      activeUsers,
      newProjectsThisMonth,
    },
  }
}
