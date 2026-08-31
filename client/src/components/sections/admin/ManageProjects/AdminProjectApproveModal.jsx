import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import PopupToast from "../../../ui/PopupToast"

function AdminProjectApproveModal({ project, onConfirm, onCancel }) {
  const [note, setNote] = useState("")

  if (!project) return null

  return (
    <PopupToast show={!!project} variant="default" onClose={onCancel} position="center">
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">Setujui Project?</h3>
            <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words">
              Project <span className="font-medium text-slate-200">"{project.title}"</span> akan disetujui.
            </p>
          </div>
        </div>

        <div className="mt-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Catatan (opsional)..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
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
            onClick={() => onConfirm(project.id, note)}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 cursor-pointer"
          >
            Ya, Setujui
          </button>
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminProjectApproveModal