const { Project, Category, User } = require("../models")
const cache = require("../utils/cache")

const STATS_TTL = 60 * 1000
const STATS_KEY = "stats:public"

exports.getPublicStats = async () => {
  const cached = cache.get(STATS_KEY)
  if (cached) return cached

  const [totalProject, totalCategory, totalUser] = await Promise.all([
    Project.count({ where: { status: "published" } }),
    Category.count(),
    User.count(),
  ])

  const stats = {
    totalProject,
    totalCategory,
    totalUser,
  }

  cache.set(STATS_KEY, stats, STATS_TTL)

  return stats
}
