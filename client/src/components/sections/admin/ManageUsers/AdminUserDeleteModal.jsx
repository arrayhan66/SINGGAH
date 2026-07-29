import { AlertTriangle, X } from "lucide-react"

function AdminUserDeleteModal({ user, onConfirm, onCancel }) {
  if (!user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.06] bg-gradient-to-br from-brand-navy to-brand-dark p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-5 w-5 text-red-400" />
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
          Hapus User?
        </h3>
        <p className="mt-2 text-xs text-slate-400 min-w-0 break-words md:text-sm">
          Kamu akan menghapus akun{" "}
          <span className="font-medium text-slate-200">"{user.name}"</span>.
          Tindakan ini tidak bisa dibatalkan.
        </p>

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
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminUserDeleteModal
