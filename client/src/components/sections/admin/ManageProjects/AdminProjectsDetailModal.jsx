import { useState } from "react"
import { X, CheckCircle2, XCircle, User, Tag, Calendar } from "lucide-react"

function AdminProjectsDetailModal({ project, onApprove, onReject, onClose }) {
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  if (!project) return null

  function handleRejectSubmit() {
    if (!rejectionReason.trim()) return
    onReject(project.id, rejectionReason)
    setRejectionReason("")
    setShowRejectForm(false)
  }

  function handleClose() {
    setShowRejectForm(false)
    setRejectionReason("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-brand-navy shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h3 className="text-base md:text-lg font-semibold text-white">
            Detail Project
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 cursor-pointer hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-brand-dark">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-white break-words">
            {project.title}
          </h2>

          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <User size={15} className="shrink-0 text-cyan-400" />
              <span className="truncate">{project.User?.name || ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={15} className="shrink-0 text-cyan-400" />
              <span className="capitalize">{project.Category?.name || ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="shrink-0 text-cyan-400" />
              <span>{project.created_at || ""}</span>
            </div>
          </div>

          {project.status === "pending" && (
            <div className="mt-6 flex flex-col gap-3">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={16} />
                    Tolak
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove(project.id)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Setujui
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Tulis alasan penolakan..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectSubmit}
                      disabled={!rejectionReason.trim()}
                      className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Kirim Penolakan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {project.status !== "pending" && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-slate-400">
              Project ini sudah{" "}
              {project.status === "approved" ? "disetujui" : "ditolak"}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProjectsDetailModal
