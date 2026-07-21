import {
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import GlassCard from "../../../ui/GlassCard"

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

function MyProjectCard({ project, onDeleteClick }) {
  const navigate = useNavigate()
  const status = statusConfig[project.status]
  const StatusIcon = status.icon

  return (
    <GlassCard className="overflow-hidden p-0" hover>
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

        <p className="line-clamp-2 text-xs md:text-sm text-slate-400">
          {project.shortDescription}
        </p>

        {project.status === "rejected" && project.rejectionReason && (
          <div className="flex items-start gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 p-2.5 text-[11px] text-red-300">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>{project.rejectionReason}</span>
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 border-t border-white/10 pt-3">
          {project.status === "pending" && (
            <button
              type="button"
              onClick={() => navigate(`/user/upload?edit=${project.id}`)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteClick(project)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
            Hapus
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default MyProjectCard
