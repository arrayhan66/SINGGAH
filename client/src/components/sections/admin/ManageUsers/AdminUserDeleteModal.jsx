import { useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import PopupToast from "../../../ui/PopupToast"

function AdminUserDeleteModal({ user, onConfirm, onCancel, loading = false }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!user) return
    setClosing(false)
    setVisible(false)
    requestAnimationFrame(() => setVisible(true))
  }, [user])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onCancel?.(), 250)
  }

  if (!user) return null

  return (
    <PopupToast
      show={!!user}
      variant="danger"
      onClose={handleClose}
      position="center"
    >
      <div className={`transition-all duration-300 ${visible && !closing ? "opacity-100" : "opacity-0"}`}>
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/20">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="pt-1 text-sm font-semibold text-white">
                Hapus User?
              </h3>
              <p className="mt-0.5 min-w-0 break-words text-xs text-slate-400">
                Kamu akan menghapus akun{" "}
                <span className="font-medium text-slate-200">&quot;{user.name}&quot;</span>.
                Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-40"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </button>
          </div>
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminUserDeleteModal
