import { AlertTriangle, X } from "lucide-react"

function AdminCategoryDeleteModal({ category, onConfirm, onCancel }) {
  if (!category) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 animate-[fade-in_0.15s_ease-out]"
      onClick={onCancel}
    >
      <div
        className="animate-modal-in w-full max-w-sm rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30">
            <div className="absolute inset-0 rounded-2xl bg-red-500/10 animate-pulse" />
            <AlertTriangle className="relative h-5 w-5 text-red-400" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">
          Hapus Kategori
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 min-w-0 break-words">
          Kamu akan menghapus kategori{" "}
          <span className="font-semibold text-cyan-300">&quot;{category.name}&quot;</span>.
          Karya yang sudah terlanjur menggunakan kategori ini tidak akan bisa
          mengaksesnya lagi.
        </p>
        <p className="mt-2 text-xs font-medium text-red-400/80">
          Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="group flex-1 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="group flex-1 cursor-pointer rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700 hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminCategoryDeleteModal
