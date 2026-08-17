const { Project, Category, User, ProjectView } = require("../models")
const cache = require("../utils/cache")

const STATS_TTL = 60 * 1000
const STATS_KEY = "stats:public"

exports.getPublicStats = async () => {
  const cached = cache.get(STATS_KEY)
  if (cached) return cached

  const [totalProject, totalCategory, totalUser, totalVisitors] = await Promise.all([
    Project.count({ where: { status: "published" } }),
    Category.count(),
    User.count(),
    ProjectView.count(),
  ])

  const stats = {
    totalProject,
    totalCategory,
    totalUser,
    totalVisitors,
  }

  cache.set(STATS_KEY, stats, STATS_TTL)

  return stats
}
