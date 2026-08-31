import { LogOut } from "lucide-react"
import PopupToast from "./PopupToast"

function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <PopupToast show variant="danger" onClose={onCancel} position="center">
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
            <LogOut className="h-4.5 w-4.5 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">Yakin ingin keluar?</h3>
            <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
              Kamu akan kembali ke halaman login.
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
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600 cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </PopupToast>
  )
}

export default LogoutConfirmModal