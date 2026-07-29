import { Search, Clock, CheckCircle2, XCircle, LayoutGrid } from "lucide-react"

const tabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "pending", label: "Menunggu", icon: Clock },
  { value: "approved", label: "Disetujui", icon: CheckCircle2 },
  { value: "rejected", label: "Ditolak", icon: XCircle },
]

function AdminProjectsFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
}) {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Cari judul atau nama mahasiswa..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = statusFilter === tab.value
          const count = counts?.[tab.value]

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/10 text-white border border-white/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {count !== undefined && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AdminProjectsFilter
