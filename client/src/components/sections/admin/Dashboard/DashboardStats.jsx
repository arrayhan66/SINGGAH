import { FolderOpen, Clock, CheckCircle2, Newspaper } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"
import { beritaData } from "../../../../data/beritaData"

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
      color: "text-cyan-400",
    },
    {
      label: "Menunggu Review",
      value: pendingProject,
      icon: Clock,
      color: "text-amber-400",
    },
    {
      label: "Disetujui",
      value: approvedProject,
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Total Berita",
      value: totalBerita,
      icon: Newspaper,
      color: "text-blue-400",
    },
  ]

  return (
    <div className="px-6 py-4 md:px-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-xl font-bold text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1 truncate text-[11px] md:text-xs text-slate-400">
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
