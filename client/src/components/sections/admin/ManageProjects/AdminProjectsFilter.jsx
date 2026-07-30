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
  )
}

export default AdminProjectsFilter
