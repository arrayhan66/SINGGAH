import { useState, useEffect } from "react"
import { XCircle, X } from "lucide-react"

const predefinedReasons = [
  "Dokumentasi tidak lengkap",
  "Karya tidak sesuai pedoman",
  "Kode sumber tidak disertakan",
  "Deskripsi kurang detail",
  "Duplikasi dengan karya lain",
  "Tidak memenuhi standar akademik",
]

function AdminProjectRejectModal({ project, onConfirm, onCancel }) {
  const [rejectionReason, setRejectionReason] = useState("")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  if (!project) return null

  function handlePredefinedReason(reason) {
    setRejectionReason((prev) => {
      const reasons = prev.split(", ").filter(Boolean)
      if (reasons.includes(reason)) {
        return reasons.filter((r) => r !== reason).join(", ")
      }
      return [...reasons, reason].join(", ")
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-br from-brand-navy to-brand-dark p-6 shadow-2xl backdrop-blur-xl animate-modal-in max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer text-slate-400 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-4 text-base font-semibold text-white md:text-lg">
          Tolak Project?
        </h3>
        <p className="mt-2 text-xs text-slate-400 min-w-0 break-words md:text-sm">
          Project <span className="font-medium text-slate-200">"{project.title}"</span> akan ditolak. Pilih alasan atau tulis secara manual.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {predefinedReasons.map((reason) => {
            const selected = rejectionReason.includes(reason)
            return (
              <button
                key={reason}
                type="button"
                onClick={() => handlePredefinedReason(reason)}
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  selected
                    ? "border-red-400/50 bg-red-500/20 text-red-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                }`}
              >
                {reason}
              </button>
            )
          })}
        </div>

        <div className="mt-4">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Atau tulis alasan penolakan secara manual..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none transition-colors"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(project.id, rejectionReason)}
            disabled={!rejectionReason.trim()}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kirim Penolakan
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectRejectModal
