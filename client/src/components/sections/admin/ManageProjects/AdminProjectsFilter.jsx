import { Clock, CheckCircle2, XCircle, LayoutGrid } from "lucide-react"

const tabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "pending", label: "Menunggu", icon: Clock },
  { value: "approved", label: "Disetujui", icon: CheckCircle2 },
  { value: "rejected", label: "Ditolak", icon: XCircle },
]

function AdminProjectsFilter({
  statusFilter,
  onStatusChange,
  counts,
}) {
  return (
    <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = statusFilter === tab.value
        const count = counts?.[tab.value]

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            aria-pressed={isActive}
          >
            <Icon
              className={`h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
            />
            {tab.label}
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-white/[0.07] text-slate-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default AdminProjectsFilter
