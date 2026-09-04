import { FolderOpen, Clock, CheckCircle2, XCircle } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

const STAT_CONFIG = [
  {
    key: null,
    label: "Total Karya",
    caption: "Karya yang pernah kamu kirim",
    icon: FolderOpen,
    color: "text-cyan-300",
  },
  {
    key: "pending",
    label: "Menunggu Review",
    caption: "Sedang diperiksa admin",
    icon: Clock,
    color: "text-amber-300",
  },
  {
    key: "published",
    label: "Disetujui",
    caption: "Sudah tampil di galeri",
    icon: CheckCircle2,
    color: "text-emerald-300",
  },
  {
    key: "rejected",
    label: "Ditolak",
    caption: "Perlu kamu perbaiki",
    icon: XCircle,
    color: "text-red-300",
  },
]

function MyKaryaStats({ stats, isDosen = false }) {
  const config = isDosen
    ? STAT_CONFIG.filter((s) => s.key === null || s.key === "published")
    : STAT_CONFIG

  const items = config.map((stat) => ({
    ...stat,
    value: stat.key ? stats[stat.key] : stats.total,
  }))

  return (
    <div className={`mt-8 grid grid-cols-2 min-[300px]:grid-cols-4 gap-3 min-[300px]:gap-4 sm:mt-10 sm:gap-5 lg:gap-7 xl:gap-8 3xl:mt-16 3xl:gap-10 4xl:mt-20 4xl:gap-12 ${isDosen ? "min-[300px]:grid-cols-2 sm:grid-cols-2" : ""}`}>
      {items.map((stat) => {
        const Icon = stat.icon
        return (
          <GlassCard key={stat.label} className="stats-card group/stats p-5 sm:p-6 md:p-7 3xl:p-8 4xl:p-10">
            <span className="stats-accent" />
            <Icon
              className="stats-watermark pointer-events-none absolute opacity-[0.12] transition-opacity duration-500 group-hover/stats:opacity-[0.2]"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start gap-2.5 min-w-0 sm:flex-row sm:items-center sm:gap-4 3xl:gap-5 4xl:gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 sm:h-12 sm:w-12 md:h-13 md:w-13 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20">
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10 ${stat.color}`} />
              </div>
              <div className="flex min-w-0 flex-col">
                <p className="text-2xl font-extrabold text-white leading-none tracking-tight sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 truncate text-[11px] font-semibold text-slate-200 sm:mt-1.5 sm:text-sm md:text-base 3xl:text-lg 4xl:text-xl">
                  {stat.label}
                </p>
                <p className="mt-0.5 hidden truncate text-[10px] font-medium text-slate-500 min-[640px]:block sm:text-[11px] md:text-xs 3xl:text-sm 4xl:text-base">
                  {stat.caption}
                </p>
              </div>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}

export default MyKaryaStats
