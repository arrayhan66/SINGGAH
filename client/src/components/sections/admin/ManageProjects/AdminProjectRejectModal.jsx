import { useState } from "react"
import { XCircle } from "lucide-react"
import PopupToast from "../../../ui/PopupToast"

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
    <PopupToast show={!!project} variant="danger" onClose={onCancel} position="center">
      <div className="px-4 py-3.5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
            <XCircle className="h-4.5 w-4.5 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">Tolak Project?</h3>
            <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words">
              Project <span className="font-medium text-slate-200">"{project.title}"</span> akan ditolak.
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1">
          {predefinedReasons.map((reason) => {
            const selected = rejectionReason.includes(reason)
            return (
              <button
                key={reason}
                type="button"
                onClick={() => handlePredefinedReason(reason)}
                className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10px] font-medium transition-all ${
                  selected
                    ? "border-red-400/50 bg-red-500/20 text-red-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {reason}
              </button>
            )
          })}
        </div>

        <div className="mt-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={2}
            placeholder="Alasan penolakan..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(project.id, rejectionReason)}
            disabled={!rejectionReason.trim()}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kirim Penolakan
          </button>
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminProjectRejectModal