import { useState, useEffect } from "react"
import { CheckCircle2, X } from "lucide-react"

function AdminProjectApproveModal({ project, onConfirm, onCancel }) {
  const [note, setNote] = useState("")

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  if (!project) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-brand-navy to-brand-dark p-6 shadow-2xl backdrop-blur-xl animate-modal-in">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
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
          Setujui Project?
        </h3>
        <p className="mt-2 text-xs text-slate-400 min-w-0 break-words md:text-sm">
          Project <span className="font-medium text-slate-200">"{project.title}"</span> akan disetujui dan langsung ditampilkan di halaman Karya.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Catatan Persetujuan (Opsional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Tambahkan catatan untuk pembuat project..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none transition-colors"
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
            onClick={() => onConfirm(project.id, note)}
            className="flex-1 cursor-pointer rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600"
          >
            Ya, Setujui
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectApproveModal
