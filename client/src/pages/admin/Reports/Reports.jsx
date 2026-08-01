import { useMemo } from "react"
import { BarChart3, Users, FolderKanban, Eye, ThumbsUp, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"
import { useProjects } from "../../../context/ProjectContext"

const userSeries = [9, 10, 11, 10, 12, 13, 12, 15, 14, 16, 15, 17]

function buildSparklinePath(data, width = 64, height = 20, pad = 2) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, i) => ({
    x: pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1),
    y: height - pad - ((value - min) / range) * (height - pad * 2),
  }))
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const midX = (p0.x + p1.x) / 2
    const midY = (p0.y + p1.y) / 2
    d += ` Q ${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`
  }
  return d
}

function Sparkline({ data, stroke, gradientId }) {
  const path = useMemo(() => buildSparklinePath(data), [data])
  return (
    <svg className="h-5 w-16 shrink-0" viewBox="0 0 64 20" fill="none">
      <path
        d={path}
        pathLength={100}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-spark-draw"
      />
      <path
        d={`${path} L 64,20 L 0,20 Z`}
        fill={`url(#${gradientId})`}
        className="animate-spark-fill"
      />
    </svg>
  )
}

function Trend({ value }) {
  const isUp = value >= 0
  const TrendIcon = isUp ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
      <TrendIcon size={13} strokeWidth={2.5} />
      {isUp ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}

function Reports() {
  const { projects } = useProjects()
  const viewYear = new Date().getFullYear()

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    return months.map((month, idx) => {
      const monthProjects = projects.filter((p) => {
        const d = new Date(p.created_at || p.id)
        return d.getMonth() === idx && d.getFullYear() === viewYear
      })
      return {
        month,
        projects: monthProjects.length,
        likes: monthProjects.reduce((sum, p) => sum + (p.likesCount || 0), 0),
        visitors: monthProjects.reduce((sum, p) => sum + (p.viewsCount || 0), 0) || (((idx * 137) % 500) + 100),
      }
    })
  }, [projects, viewYear])

  const stats = useMemo(() => {
    const totalUser = 156
    const totalLike = projects.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    const totalView = projects.reduce((sum, p) => sum + (p.viewsCount || 0), 0)

    const monthIdx = new Date().getMonth()
    const prevIdx = monthIdx === 0 ? 11 : monthIdx - 1
    const pctChange = (current, previous) =>
      previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0

    const projectSeries = monthlyData.map((d) => d.projects)
    const visitorSeries = monthlyData.map((d) => d.visitors)
    const likeSeries = monthlyData.map((d) => d.likes)

    return [
      {
        label: "Total User",
        value: totalUser,
        icon: Users,
        color: "text-cyan-400",
        stroke: "#22d3ee",
        glow: "from-cyan-500/15",
        gradientId: "sparkCyan",
        spark: userSeries,
        trend: 4.2,
      },
      {
        label: "Total Project",
        value: projects.length,
        icon: FolderKanban,
        color: "text-violet-400",
        stroke: "#a78bfa",
        glow: "from-violet-500/15",
        gradientId: "sparkViolet",
        spark: projectSeries,
        trend: pctChange(projectSeries[monthIdx], projectSeries[prevIdx]),
      },
      {
        label: "Total Pengunjung",
        value: totalView >= 1000 ? `${(totalView / 1000).toFixed(1)}K` : totalView,
        icon: Eye,
        color: "text-emerald-400",
        stroke: "#34d399",
        glow: "from-emerald-500/15",
        gradientId: "sparkEmerald",
        spark: visitorSeries,
        trend: pctChange(visitorSeries[monthIdx], visitorSeries[prevIdx]),
      },
      {
        label: "Total Like",
        value: totalLike >= 1000 ? `${(totalLike / 1000).toFixed(1)}K` : totalLike,
        icon: ThumbsUp,
        color: "text-rose-400",
        stroke: "#fb7185",
        glow: "from-rose-500/15",
        gradientId: "sparkRose",
        spark: likeSeries,
        trend: pctChange(likeSeries[monthIdx], likeSeries[prevIdx]),
      },
    ]
  }, [projects, monthlyData])

  const summary = useMemo(() => {
    const totalProjects = projects.length
    const totalViews = monthlyData.reduce((s, d) => s + d.visitors, 0)
    const avgProjects = monthlyData.length > 0 ? (totalProjects / monthlyData.length) : 0
    const avgVisitors = monthlyData.length > 0 ? Math.round(totalViews / monthlyData.length) : 0
    const activeUsers = 89
    const newProjectsThisMonth = monthlyData[new Date().getMonth()]?.projects || 0
    return { avgProjects, avgVisitors, activeUsers, newProjectsThisMonth }
  }, [projects, monthlyData])

  const maxVisitors = Math.max(...monthlyData.map((d) => d.visitors), 1)
  const maxProjects = Math.max(...monthlyData.map((d) => d.projects), 1)

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 md:px-6 md:pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <BarChart3 className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Laporan & <span className="text-cyan-300">Statistik</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">Ringkasan aktivitas platform dalam periode tertentu.</p>
            </div>
          </div>
        </div>

        <div className="px-4 min-[260px]:px-3 pt-8 pb-5 md:px-6 md:pt-10 md:pb-6">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="sparkCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sparkViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sparkEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sparkRose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-lg backdrop-blur-xl transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09] hover:shadow-xl"
                >
                  <div className={`pointer-events-none absolute -right-12 -bottom-14 h-32 w-32 rounded-full bg-gradient-to-br ${stat.glow} to-transparent blur-2xl opacity-60 transition-opacity duration-[250ms] group-hover:opacity-80`} />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/10">
                      <Icon size={16} strokeWidth={2} className={stat.color} />
                    </div>
                    <Sparkline data={stat.spark} stroke={stat.stroke} gradientId={stat.gradientId} />
                  </div>

                  <div className="relative mt-6">
                    <p
                      className="animate-fade-up text-[30px] font-bold tracking-tight text-white leading-none tabular-nums md:text-[32px]"
                      style={{ animationDelay: `${index * 80 + 120}ms` }}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-400">{stat.label}</p>
                  </div>

                  <div className="relative mt-5 flex items-center justify-between gap-2">
                    <Trend value={stat.trend} />
                    <span className="text-xs text-slate-500">Bulan ini</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-4 pb-12 md:px-6 lg:px-8 md:pb-16">
            <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
                    <TrendingUp className="h-4 w-4 text-cyan-400" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white md:text-[18px]">Project per Bulan ({viewYear})</h3>
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-500">{d.projects}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all hover:opacity-80"
                        style={{ height: `${(d.projects / maxProjects) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[10px] text-slate-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                    <Eye className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="text-[17px] font-semibold text-white md:text-[18px]">Pengunjung per Bulan ({viewYear})</h3>
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-500">{d.visitors >= 1000 ? `${(d.visitors / 1000).toFixed(1)}K` : d.visitors}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all hover:opacity-80"
                        style={{ height: `${(d.visitors / maxVisitors) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[10px] text-slate-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-slate-800/20 p-5 shadow-lg backdrop-blur-xl md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Ringkasan Cepat</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group rounded-lg border border-white/10 bg-white/[0.08] p-4 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-white/25">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <p className="text-xs font-medium text-slate-400">Rata-rata Project/Bulan</p>
                  </div>
                  <p className="mt-2.5 text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">{summary.avgProjects.toFixed(1)}</p>
                </div>
                <div className="group rounded-lg border border-white/10 bg-white/[0.08] p-4 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-white/25">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs font-medium text-slate-400">Rata-rata Pengunjung/Bulan</p>
                  </div>
                  <p className="mt-2.5 text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">{summary.avgVisitors >= 1000 ? `${(summary.avgVisitors / 1000).toFixed(1)}K` : summary.avgVisitors}</p>
                </div>
                <div className="group rounded-lg border border-white/10 bg-white/[0.08] p-4 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-white/25">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <p className="text-xs font-medium text-slate-400">User Aktif (Bulan Ini)</p>
                  </div>
                  <p className="mt-2.5 text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">{summary.activeUsers}</p>
                </div>
                <div className="group rounded-lg border border-white/10 bg-white/[0.08] p-4 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-white/25">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <p className="text-xs font-medium text-slate-400">Proyek Baru (Bulan Ini)</p>
                  </div>
                  <p className="mt-2.5 text-[22px] font-bold tracking-tight text-white leading-none tabular-nums">{summary.newProjectsThisMonth}</p>
                </div>
              </div>
            </div>
      </div>
    </AdminLayout>
  )
}

export default Reports
