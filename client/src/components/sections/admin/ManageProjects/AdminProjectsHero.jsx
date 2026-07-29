import { FolderKanban, Clock, CheckCircle2, XCircle, LayoutGrid } from "lucide-react"

const statCards = [
  {
    key: "total",
    label: "Total Project",
    icon: LayoutGrid,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    key: "pending",
    label: "Menunggu Review",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    key: "approved",
    label: "Disetujui",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    key: "rejected",
    label: "Ditolak",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
]

function AdminProjectsHero({ stats }) {
  return (
    <div className="px-6 pt-8 pb-6 md:px-10 md:pt-10 md:pb-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30">
          <FolderKanban className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Kelola Project
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Tinjau, setujui, atau tolak project yang diunggah mahasiswa.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((s) => {
          const Icon = s.icon
          const count = stats?.[s.key] ?? 0
          return (
            <div
              key={s.key}
              className={`rounded-xl border ${s.border} ${s.bg} p-4 md:p-5 backdrop-blur-xl transition-all hover:brightness-110`}
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-white leading-none tabular-nums">
                    {count}
                  </p>
                </div>
                <p className="truncate text-[11px] md:text-xs text-slate-400 text-right leading-tight">
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminProjectsHero
