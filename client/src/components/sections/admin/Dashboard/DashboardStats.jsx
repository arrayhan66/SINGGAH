import { FolderOpen, Clock, CheckCircle2, Newspaper } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"
import { beritaData } from "../../../../data/beritaData"

const sparklinePaths = {
  "Total Project": { d: "M0,26 C12,28 18,10 30,14 S42,4 54,6 S60,2 72,0", fill: "url(#sparkViolet)" },
  "Menunggu Review": { d: "M0,24 C12,26 18,18 30,16 S42,8 54,10 S60,4 72,4", fill: "url(#sparkOrange)" },
  "Disetujui": { d: "M0,28 C12,24 18,20 30,12 S42,6 54,4 S60,1 72,2", fill: "url(#sparkEmerald)" },
  "Total Berita": { d: "M0,22 C12,24 18,14 30,18 S42,6 54,8 S60,3 72,0", fill: "url(#sparkPink)" },
}

function Sparkline({ path, stroke }) {
  return (
    <svg className="shrink-0" width="72" height="28" viewBox="0 0 72 28" fill="none">
      <path d={path.d} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      <path d={`${path.d} L72,28 L0,28 Z`} fill={path.fill} opacity="0.15" />
    </svg>
  )
}

function DashboardStats() {
  const totalProject = dummyAdminProjects.length
  const pendingProject = dummyAdminProjects.filter(
    (p) => p.status === "pending",
  ).length
  const approvedProject = dummyAdminProjects.filter(
    (p) => p.status === "approved",
  ).length
  const totalBerita = beritaData.length

  const stats = [
    {
      label: "Total Project",
      value: totalProject,
      icon: FolderOpen,
      color: "text-violet-400",
      stroke: "#a78bfa",
      iconBg: "bg-violet-500/10",
      gradient: "from-violet-500 to-violet-400",
    },
    {
      label: "Menunggu Review",
      value: pendingProject,
      icon: Clock,
      color: "text-orange-400",
      stroke: "#fb923c",
      iconBg: "bg-orange-500/10",
      gradient: "from-amber-500 to-orange-400",
    },
    {
      label: "Disetujui",
      value: approvedProject,
      icon: CheckCircle2,
      color: "text-emerald-400",
      stroke: "#34d399",
      iconBg: "bg-emerald-500/10",
      gradient: "from-emerald-500 to-emerald-400",
    },
    {
      label: "Total Berita",
      value: totalBerita,
      icon: Newspaper,
      color: "text-pink-400",
      stroke: "#f472b6",
      iconBg: "bg-pink-500/10",
      gradient: "from-pink-500 to-rose-400",
    },
  ]

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="sparkViolet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkEmerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.09] hover:border-white/20 md:p-6"
            >
              <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${stat.gradient} rounded-l-2xl`} />
              <div className="flex items-start justify-between gap-2 pl-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[28px] font-bold text-white leading-none md:text-[32px]">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Sparkline path={sparklinePaths[stat.label]} stroke={stat.stroke} />
                  <p className="truncate text-[10px] text-slate-400 text-right leading-tight md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardStats
