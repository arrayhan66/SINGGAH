import { useState, useEffect } from "react"
import { X, CheckCircle2, XCircle, Tag, Calendar, Heart, Eye, Clock, Layers } from "lucide-react"

function AdminProjectsDetailModal({ project, onApproveClick, onRejectClick, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  if (!project) return null

  function handleClose() {
    setVisible(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const StatusIcon = project.status === "approved" ? CheckCircle2 : project.status === "rejected" ? XCircle : Clock
  const statusLabel = project.status === "approved" ? "Disetujui" : project.status === "rejected" ? "Ditolak" : "Menunggu Review"
  const statusColor = project.status === "approved"
    ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
    : project.status === "rejected"
    ? "text-red-300 border-red-400/30 bg-red-400/10"
    : "text-amber-300 border-amber-400/30 bg-amber-400/10"

  const techStack = Array.isArray(project.technologies) ? project.technologies : []
  const images = Array.isArray(project.images) ? project.images : []

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-brand-navy shadow-2xl transition-all duration-200 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-brand-navy/90 backdrop-blur-md px-5 py-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusColor}`}>
              <StatusIcon size={12} />
              {statusLabel}
            </span>
            <span className="text-xs text-slate-500">ID: #{project.id}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="aspect-video w-full overflow-hidden bg-brand-dark">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-5 pb-4 -mt-3 relative z-10">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.image_url}
                  alt={`${project.title} ${i + 1}`}
                  className="h-14 w-20 shrink-0 rounded-lg object-cover border border-white/10"
                />
              ))}
            </div>
          )}

          <div className="px-5 pb-5 -mt-1">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-sm">
                {project.User?.name?.charAt(0) || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {project.User?.name || ""}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {project.User?.nim || ""}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <h2 className="text-xl font-bold text-white leading-snug">
              {project.title}
            </h2>

            {project.description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {project.description}
              </p>
            )}
          </div>

          <div className="px-5 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              {project.Category?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium text-cyan-300">
                  <Tag className="h-3 w-3" />
                  {project.Category.name}
                </span>
              )}
              {project.year && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {project.year}
                </span>
              )}
              {project.created_at && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {project.created_at}
                </span>
              )}
            </div>
          </div>

          {techStack.length > 0 && (
            <div className="border-t border-white/5 px-5 py-4">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
                <Layers className="h-3.5 w-3.5" />
                Teknologi
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-300/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/5 px-5 py-4">
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-pink-400/70" />
                {project.likesCount ?? 0} suka
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-slate-400/70" />
                {project.viewsCount ?? 0} dilihat
              </span>
            </div>
          </div>

          {project.status === "rejected" && project.rejectionReason && (
            <div className="border-t border-white/5 px-5 py-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-2">
                  <XCircle className="h-3.5 w-3.5" />
                  Alasan Penolakan
                </h4>
                <p className="text-sm leading-relaxed text-red-200/80">
                  {project.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {project.status === "approved" && (
            <div className="border-t border-white/5 px-5 py-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-200/80">
                    Project ini sudah disetujui dan ditampilkan di halaman Karya.
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.status === "pending" && (
            <div className="border-t border-white/10 px-5 py-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onApproveClick(project)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                >
                  <CheckCircle2 size={18} />
                  Setujui
                </button>
                <button
                  type="button"
                  onClick={() => onRejectClick(project)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <XCircle size={18} />
                  Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProjectsDetailModal
