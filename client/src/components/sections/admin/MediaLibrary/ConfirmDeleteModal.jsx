import { AlertTriangle } from "lucide-react"
import PopupToast from "../../../../components/ui/PopupToast"

export default function ConfirmDeleteModal({ item, onConfirm, onCancel }) {
  if (!item) return null

  return (
    <PopupToast show={!!item} variant="danger" onClose={onCancel}>
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">Hapus File</h3>
            <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words">
              Hapus file <span className="font-semibold text-cyan-300">&quot;{item.name}&quot;</span>?
              Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
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
            onClick={() => onConfirm(item.id)}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-rose-700 cursor-pointer"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </PopupToast>
  )
}