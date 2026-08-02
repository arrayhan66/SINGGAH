import { Clock, CheckCircle2, XCircle, Eye, Heart, Calendar, Tag } from "lucide-react"

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "border-red-400/30 bg-red-400/10 text-red-300",
    dot: "bg-red-400",
  },
}

function AdminProjectsCard({ project, onViewDetail, onQuickApprove, onQuickReject }) {
  const StatusIcon = statusConfig[project.status]?.icon || Clock
  const status = statusConfig[project.status]
  const authorInitial = project.User?.name?.charAt(0) || "?"
  const categoryName = project.Category?.name || ""

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.04] shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/20">
      <div
        className="aspect-video w-full overflow-hidden bg-brand-navy relative cursor-pointer"
        onClick={() => onViewDetail(project)}
      >
        <img
          src={project.thumbnail}
          alt={project.title}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm ${status.className}`}
          >
            <StatusIcon size={11} />
            {status.label}
          </span>

          {project.status === "pending" && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[11px] font-bold text-white shadow-sm">
            {authorInitial}
          </div>
          <p className="truncate text-sm font-semibold text-white">
            {project.User?.name || ""}
          </p>
        </div>

        <h3 className="mt-3 text-sm font-semibold text-white leading-snug line-clamp-2">
          {project.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {categoryName && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {categoryName}
            </span>
          )}
          {project.year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.year}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {project.likesCount ?? 0}
          </span>
        </div>

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-4 md:flex-row md:items-center lg:flex-row lg:items-center">
          {project.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => onViewDetail(project)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                <Eye className="h-3.5 w-3.5" />
                Detail
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickReject?.(project)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <XCircle className="h-3.5 w-3.5" />
                Tolak
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickApprove?.(project.id)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Setujui
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onViewDetail(project)}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              <Eye className="h-3.5 w-3.5" />
              Lihat Detail
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProjectsCard
