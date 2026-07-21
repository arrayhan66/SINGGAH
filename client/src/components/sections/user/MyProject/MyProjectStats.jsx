import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react"
import { dummyProjects } from "./dummyProjects"
import GlassCard from "../../../ui/GlassCard"

function MyProjectStats() {
  const total = dummyProjects.length
  const pending = dummyProjects.filter((p) => p.status === "pending").length
  const approved = dummyProjects.filter((p) => p.status === "approved").length
  const rejected = dummyProjects.filter((p) => p.status === "rejected").length

  const stats = [
    {
      label: "Total Project",
      value: total,
      icon: FolderOpen,
      color: "text-cyan-300",
    },
    {
      label: "Menunggu Review",
      value: pending,
      icon: Clock,
      color: "text-amber-300",
    },
    {
      label: "Disetujui",
      value: approved,
      icon: CheckCircle2,
      color: "text-emerald-300",
    },
    { label: "Ditolak", value: rejected, icon: XCircle, color: "text-red-300" },
  ]

  return (
    <section className="relative bg-brand-dark px-4 pb-4 md:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <GlassCard key={stat.label} className="p-4 md:p-5">
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
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}

export default MyProjectStats
