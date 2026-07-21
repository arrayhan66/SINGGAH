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
      color: "text-cyan-300",
    },
    {
      label: "Menunggu Review",
      value: pendingProject,
      icon: Clock,
      color: "text-amber-300",
    },
    {
      label: "Disetujui",
      value: approvedProject,
      icon: CheckCircle2,
      color: "text-emerald-300",
    },
    {
      label: "Total Berita",
      value: totalBerita,
      icon: Newspaper,
      color: "text-blue-300",
    },
  ]

  return (
    <div className="px-6 md:px-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
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
