import { Clock, CheckCircle2, XCircle, Eye } from "lucide-react"

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "border-red-400/30 bg-red-400/10 text-red-300",
  },
}

function AdminProjectsCard({ project, onViewDetail }) {
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="aspect-video w-full overflow-hidden bg-brand-navy">
        <img
          src={project.thumbnail}
          alt={project.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-2.5 p-4 min-w-0">
        <span
          className={`flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${status.className}`}
        >
          <StatusIcon size={12} />
          {status.label}
        </span>

        <h3 className="truncate text-sm md:text-base font-semibold text-white">
          {project.title}
        </h3>

        <p className="truncate text-xs text-slate-400">{project.User?.name || ""}</p>

        <button
          type="button"
          onClick={() => onViewDetail(project)}
          className="mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-400/20 transition-colors"
        >
          <Eye size={13} />
          Lihat Detail
        </button>
      </div>
    </div>
  )
}

export default AdminProjectsCard
