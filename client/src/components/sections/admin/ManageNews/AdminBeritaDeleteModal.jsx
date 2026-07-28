import { AlertTriangle, X } from "lucide-react"

function AdminBeritaDeleteModal({ berita, onConfirm, onCancel }) {
  if (!berita) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-brand-navy p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 cursor-pointer hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-4 text-base md:text-lg font-semibold text-white">
          Hapus Berita?
        </h3>
        <p className="mt-2 text-xs md:text-sm text-slate-400 min-w-0 break-words">
          Kamu akan menghapus{" "}
          <span className="font-medium text-slate-200">"{berita.title}"</span>.
          Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminBeritaDeleteModal
