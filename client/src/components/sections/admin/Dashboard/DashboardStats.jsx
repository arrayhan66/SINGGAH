import { FolderOpen, Clock, CheckCircle2, Newspaper } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"
import { beritaData } from "../../../../data/beritaData"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"

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
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      label: "Menunggu Review",
      value: pendingProject,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      label: "Disetujui",
      value: approvedProject,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Total Berita",
      value: totalBerita,
      icon: Newspaper,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ]

  return (
    <div className="relative overflow-hidden px-6 py-4 md:px-10">
      <GlowBackground />
      <DustBackground />
      <div className="relative z-10">
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`rounded-xl border ${stat.border} ${stat.bg} p-4 md:p-5 backdrop-blur-xl`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-white leading-none">
                      {stat.value}
                    </p>
                  </div>
                  <p className="truncate text-[11px] md:text-xs text-slate-400 text-right">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
