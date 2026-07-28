import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

const STAT_CONFIG = [
  {
    key: null,
    label: "Total Project",
    icon: FolderOpen,
    color: "text-cyan-300",
  },
  {
    key: "pending",
    label: "Menunggu Review",
    icon: Clock,
    color: "text-amber-300",
  },
  {
    key: "published",
    label: "Disetujui",
    icon: CheckCircle2,
    color: "text-emerald-300",
  },
  {
    key: "rejected",
    label: "Ditolak",
    icon: XCircle,
    color: "text-red-300",
  },
]

function MyProjectStats({ stats }) {
  const items = STAT_CONFIG.map((stat) => ({
    ...stat,
    value: stat.key ? stats[stat.key] : stats.total,
  }))

  return (
    <div className="mt-8 grid grid-cols-2 gap-5 sm:mt-10 sm:grid-cols-4 sm:gap-6 md:gap-7 lg:gap-8 3xl:mt-16 3xl:gap-10 4xl:mt-20 4xl:gap-12">
      {items.map((stat) => {
        const Icon = stat.icon
        return (
          <GlassCard key={stat.label} className="p-5 sm:p-6 md:p-7 3xl:p-8 4xl:p-10">
            <div className="flex items-center gap-3 min-w-0 sm:gap-4 3xl:gap-5 4xl:gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 sm:h-12 sm:w-12 md:h-13 md:w-13 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20">
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white leading-none sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm md:text-base 3xl:text-lg 4xl:text-xl">
                  {stat.label}
                </p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

export default MyProjectStats
