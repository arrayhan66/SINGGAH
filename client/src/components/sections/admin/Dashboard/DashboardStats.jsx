import { useEffect, useState } from "react"
import { FolderOpen, Newspaper, Users, Clock } from "lucide-react"
import api from "../../../../services/api"
import { buildSparklinePath } from "../../../../utils/reportsHelpers"

const ACCENT_GRADIENT = "from-cyan-500 to-cyan-400"

const SERIES_KEYS = {
  "Total Karya": "projects",
  "Total Berita": "news",
  "Total User": "users",
  "Menunggu Review": "pending",
}

const LINE_THEME = { stroke: "#22d3ee", gradId: "dashSparkCyan" }

function Sparkline({ d, stroke, gradId }) {
  return (
    <svg className="sparkline shrink-0" width="72" height="28" viewBox="0 0 72 28" fill="none">
      <path d={d} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      <path d={`${d} L72,28 L0,28 Z`} fill={`url(#${gradId})`} opacity="0.15" />
    </svg>
  )
}

function DashboardStats() {
  const [stats, setStats] = useState({
    totalProject: 0,
    pendingProject: 0,
    totalNews: 0,
    totalUser: 0,
  })
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .get("/dashboard")
      .then((res) => {
        const data = res.data?.data || {}
        if (isMounted) {
          setStats({
            totalProject: data.stats?.totalProject || 0,
            pendingProject: data.stats?.pendingProject || 0,
            totalNews: data.stats?.totalNews || 0,
            totalUser: data.stats?.totalUser || 0,
          })
          setMonthly(data.monthly || [])
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const statItems = [
    { label: "Total Karya", value: stats.totalProject, icon: FolderOpen },
    { label: "Total Berita", value: stats.totalNews, icon: Newspaper },
    { label: "Total User", value: stats.totalUser, icon: Users },
    { label: "Menunggu Review", value: stats.pendingProject, icon: Clock },
  ]

  const series = (key) => {
    const source =
      Array.isArray(monthly) && monthly.length === 12
        ? monthly
        : Array.from({ length: 12 }, () => ({}))
    return source.map((m) => m[key] || 0)
  }

  return (
    <div className="px-4 min-[260px]:px-3 pt-2 pb-5 md:px-6 md:pt-3 md:pb-6">
      <svg width="0" height="0" className="absolute">
        <defs>
          {[LINE_THEME].map((theme) => (
            <linearGradient key={theme.gradId} id={theme.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4 gap-3 md:gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon
          const key = stat.label
          const d = buildSparklinePath(series(SERIES_KEYS[key]), 72, 28, 3)
          return (
            <div
              key={key}
              className="dashboard-stat-card group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.09] hover:border-white/20 md:p-6"
            >
              <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${ACCENT_GRADIENT} rounded-l-2xl`} />
              {loading ? (
                <div className="flex items-center justify-between gap-2 pl-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-white/10" />
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-white/10" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="h-7 w-[72px] animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
              ) : (
              <div className="flex items-start justify-between gap-2 pl-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="stat-value text-[28px] font-bold text-white leading-none md:text-[32px]">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="origin-right transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                    <Sparkline d={d} stroke={LINE_THEME.stroke} gradId={LINE_THEME.gradId} />
                  </div>
                  <p className="stat-label truncate text-[10px] text-slate-400 text-right leading-tight md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardStats