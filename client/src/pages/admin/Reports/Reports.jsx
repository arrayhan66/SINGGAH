import { useMemo } from "react"
import { BarChart3, Users, FolderKanban, Eye, ThumbsUp, TrendingUp, TrendingDown, Calendar, UserCheck, Sparkles } from "lucide-react"
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

const barTheme = {
  cyan: {
    bar: "from-cyan-500 to-cyan-300",
    top: "text-cyan-400",
    iconWrap: "border-cyan-400/30 bg-cyan-500/15 shadow-cyan-500/20",
    iconText: "text-cyan-300",
    badge: "border-cyan-400/20 bg-cyan-500/10",
    badgeText: "text-cyan-300",
    glow: "bg-cyan-500/15",
    glowShadow: "shadow-cyan-500/30",
  },
  emerald: {
    bar: "from-emerald-500 to-emerald-300",
    top: "text-emerald-400",
    iconWrap: "border-emerald-400/30 bg-emerald-500/15 shadow-emerald-500/20",
    iconText: "text-emerald-300",
    badge: "border-emerald-400/20 bg-emerald-500/10",
    badgeText: "text-emerald-300",
    glow: "bg-emerald-500/15",
    glowShadow: "shadow-emerald-500/30",
  },
}

function MonthlyBarChart({ title, subtitle, data, valueKey, color, Icon, formatter }) {
  const c = barTheme[color]
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0)
  const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1)
  const bestIndex = data.findIndex((d) => (d[valueKey] || 0) === maxValue)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 md:p-6">
      <div className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full ${c.glow} blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-80`} />
      <div className="relative mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-lg ${c.iconWrap}`}>
            <Icon className={`h-5 w-5 ${c.iconText}`} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold text-white leading-tight md:text-[18px]">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 ${c.badge}`}>
          <span className={`text-base font-black leading-none tabular-nums ${c.badgeText}`}>{formatter(total)}</span>
          <span className="mt-0.5 text-[10px] text-slate-400">Total</span>
        </div>
      </div>

      <div className="relative flex h-40 items-end gap-1.5 overflow-x-auto overflow-y-hidden">
        <div className="flex min-w-[300px] flex-1 items-end gap-1.5">
          {data.map((d, i) => {
            const val = d[valueKey] || 0
            const isBest = val > 0 && i === bestIndex
            const height = val > 0 ? Math.max((val / maxValue) * 100, 4) : 3
            return (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className={`text-[10px] font-semibold tabular-nums ${val > 0 ? c.top : "text-slate-600"}`}>
                  {formatter(val)}
                </span>
                <div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${c.bar} transition-all duration-200 ${
                    isBest ? `${c.glowShadow} shadow-lg opacity-100` : "opacity-60 group-hover:opacity-100"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className={`text-[10px] ${isBest ? `font-semibold ${c.badgeText}` : "text-slate-500"}`}>
                  {d.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const summaryTheme = {
  cyan: { wrap: "border-cyan-400/40 bg-cyan-400/15 shadow-cyan-500/20", text: "text-cyan-300", grad: "from-cyan-500/20 via-cyan-500/[0.06] to-transparent", glow: "bg-cyan-500/15" },
  emerald: { wrap: "border-emerald-400/40 bg-emerald-400/15 shadow-emerald-500/20", text: "text-emerald-300", grad: "from-emerald-500/20 via-emerald-500/[0.06] to-transparent", glow: "bg-emerald-500/15" },
  blue: { wrap: "border-blue-400/40 bg-blue-400/15 shadow-blue-500/20", text: "text-blue-300", grad: "from-blue-500/20 via-blue-500/[0.06] to-transparent", glow: "bg-blue-500/15" },
  amber: { wrap: "border-amber-400/40 bg-amber-400/15 shadow-amber-500/20", text: "text-amber-300", grad: "from-amber-500/20 via-amber-500/[0.06] to-transparent", glow: "bg-amber-500/15" },
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const c = summaryTheme[color]
  return (
    <div className={`group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${c.grad} px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20`}>
      <Icon className={`absolute -right-2 -top-2 h-20 w-20 rotate-12 ${c.text} opacity-[0.07] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`} />
      <div className="relative flex items-center gap-3.5">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-lg ${c.wrap}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-black leading-tight text-white tabular-nums">{value}</p>
          <p className="truncate text-xs leading-tight text-slate-300/80">{label}</p>
        </div>
      </div>
    </div>
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

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 md:px-6 md:pt-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <BarChart3 className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Laporan & <span className="text-cyan-300">Statistik</span>
              </h1>
              <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">Ringkasan aktivitas platform dalam periode tertentu.</p>
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
        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-2">
          <MonthlyBarChart
            title="Project per Bulan"
            subtitle={`Tahun ${viewYear}`}
            data={monthlyData}
            valueKey="projects"
            color="cyan"
            Icon={TrendingUp}
            formatter={(v) => v.toString()}
          />
          <MonthlyBarChart
            title="Pengunjung per Bulan"
            subtitle={`Tahun ${viewYear}`}
            data={monthlyData}
            valueKey="visitors"
            color="emerald"
            Icon={Eye}
            formatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString())}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-500/20">
              <Calendar className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Ringkasan Cepat</h3>
              <p className="text-xs text-slate-400">Gambaran singkat aktivitas platform.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1500px]:grid-cols-4">
            <SummaryCard icon={FolderKanban} label="Rata-rata Project/Bulan" value={summary.avgProjects.toFixed(1)} color="cyan" />
            <SummaryCard icon={Eye} label="Rata-rata Pengunjung/Bulan" value={summary.avgVisitors >= 1000 ? `${(summary.avgVisitors / 1000).toFixed(1)}K` : summary.avgVisitors} color="emerald" />
            <SummaryCard icon={UserCheck} label="User Aktif (Bulan Ini)" value={summary.activeUsers} color="blue" />
            <SummaryCard icon={Sparkles} label="Proyek Baru (Bulan Ini)" value={summary.newProjectsThisMonth} color="amber" />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Reports
