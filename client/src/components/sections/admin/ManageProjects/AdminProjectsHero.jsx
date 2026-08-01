import { FolderKanban, Clock, CheckCircle2, XCircle, LayoutGrid, Search, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import AdminProjectsFilter from "./AdminProjectsFilter"

const statCards = [
  {
    key: "total",
    label: "Total Project",
    icon: LayoutGrid,
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
  {
    key: "pending",
    label: "Menunggu Review",
    icon: Clock,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    key: "approved",
    label: "Disetujui",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    key: "rejected",
    label: "Ditolak",
    icon: XCircle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
  },
]

function AdminProjectsHero({ stats, search, onSearchChange, statusFilter, onStatusChange }) {
  const navigate = useNavigate()

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="flex items-center gap-4 md:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-500/10 sm:h-16 sm:w-16">
            <FolderKanban className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              Kelola <span className="text-cyan-300">Project</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-slate-300/90">
              Tinjau, setujui, atau tolak project yang diunggah mahasiswa.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-8 pb-5 md:px-6 md:pt-10 md:pb-6 lg:px-8">
        <div className="animate-fade-in-up rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-xl md:px-6 md:py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 min-[500px]:grid-cols-4 min-[500px]:gap-0 min-[500px]:divide-x min-[500px]:divide-white/[0.06]">
            {statCards.map((stat) => {
              const Icon = stat.icon
              const count = stats?.[stat.key] ?? 0
              return (
                <div key={stat.key} className="group flex items-center gap-3 min-w-0 min-[500px]:px-5 min-[500px]:first:pl-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${stat.iconBg}`}>
                    <Icon className={`h-[18px] w-[18px] ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-white leading-tight md:text-xl tabular-nums">
                      {count}
                    </p>
                    <p className="truncate text-[11px] text-slate-400 leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 md:px-6 md:pb-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder="Cari judul atau nama mahasiswa..."
              className="w-full rounded-xl border border-slate-200/90 bg-slate-100 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 shadow-lg shadow-black/20 outline-none transition-all duration-[250ms] focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects/tambah")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah Project
          </button>
        </div>

        <div className="mt-4 md:mt-5">
          <AdminProjectsFilter
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
            counts={{ all: stats?.total ?? 0, ...stats }}
          />
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminProjectsHero
