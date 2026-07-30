import { useMemo, useState } from "react"
import { BarChart3, Users, FolderKanban, Eye, ThumbsUp, TrendingUp, Calendar } from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"
import { useProjects } from "../../../context/ProjectContext"
import { useBerita } from "../../../context/BeritaContext"

function Reports() {
  const { projects } = useProjects()
  const { beritaList } = useBerita()
  const year = new Date().getFullYear()
  const [viewYear, setViewYear] = useState(year)

  const stats = useMemo(() => {
    const totalUser = 156
    const totalLike = projects.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    const totalView = projects.reduce((sum, p) => sum + (p.viewsCount || 0), 0)

    return [
      { label: "Total User", value: totalUser, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
      { label: "Total Project", value: projects.length, icon: FolderKanban, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
      { label: "Total Pengunjung", value: totalView >= 1000 ? `${(totalView / 1000).toFixed(1)}K` : totalView, icon: Eye, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { label: "Total Like", value: totalLike >= 1000 ? `${(totalLike / 1000).toFixed(1)}K` : totalLike, icon: ThumbsUp, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    ]
  }, [projects])

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
        visitors: monthProjects.reduce((sum, p) => sum + (p.viewsCount || 0), 0) || Math.floor(Math.random() * 500 + 100),
      }
    })
  }, [projects, viewYear])

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
      <AdminHeroBackground>
        <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-400/10 border border-rose-400/30">
              <BarChart3 className="h-6 w-6 text-rose-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Laporan & Statistik</h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">Ringkasan aktivitas platform dalam periode tertentu.</p>
            </div>
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-4 md:px-6 lg:px-8">
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className={`rounded-xl border ${s.border} ${s.bg} p-4 md:p-5 backdrop-blur-xl transition-all hover:brightness-110`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                          <Icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-white leading-none tabular-nums">{s.value}</p>
                      </div>
                      <p className="truncate text-[11px] md:text-xs text-slate-400 text-right leading-tight">{s.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/10 bg-slate-800/20 p-5 md:p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white">Project per Bulan ({viewYear})</h3>
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-500">{d.projects}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-400 transition-all hover:opacity-80"
                        style={{ height: `${(d.projects / maxProjects) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[10px] text-slate-500">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800/20 p-5 md:p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Pengunjung per Bulan ({viewYear})</h3>
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

            <div className="mt-6 rounded-xl border border-white/10 bg-slate-800/20 p-5 md:p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Ringkasan Cepat</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Rata-rata Project/Bulan</p>
                  <p className="text-lg font-bold text-white mt-1">{summary.avgProjects.toFixed(1)}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Rata-rata Pengunjung/Bulan</p>
                  <p className="text-lg font-bold text-white mt-1">{summary.avgVisitors >= 1000 ? `${(summary.avgVisitors / 1000).toFixed(1)}K` : summary.avgVisitors}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">User Aktif (Bulan Ini)</p>
                  <p className="text-lg font-bold text-white mt-1">{summary.activeUsers}</p>
                </div>
                <div className="rounded-lg bg-slate-800/40 p-3">
                  <p className="text-slate-500">Proyek Baru (Bulan Ini)</p>
                  <p className="text-lg font-bold text-white mt-1">{summary.newProjectsThisMonth}</p>
                </div>
              </div>
            </div>
      </div>
    </AdminLayout>
  )
}

export default Reports
