import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import PopupToast from "../../../ui/PopupToast"

function AdminUserDeleteModal({ user, onConfirm, onCancel, loading = false, success = false }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!user) return
    setClosing(false)
    setVisible(false)
    requestAnimationFrame(() => setVisible(true))
  }, [user])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => handleClose(), 1200)
      return () => clearTimeout(timer)
    }
  }, [success])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onCancel?.(), 250)
  }

  if (!user) return null

  return (
    <PopupToast
      show={!!user}
      variant={success ? "success" : "danger"}
      onClose={handleClose}
      position={success ? "top-right" : "center"}
      duration={1200}
    >
      <div className={`transition-all duration-300 ${visible && !closing ? "opacity-100" : "opacity-0"}`}>
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              success ? "bg-emerald-500/20 border-emerald-500/30" : "bg-red-500/20 border-red-500/30"
            }`}>
              {success ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className={`pt-1 text-sm font-semibold ${
                success ? "text-emerald-300" : "text-white"
              }`}>
                {success ? "Berhasil Dihapus!" : "Hapus User?"}
              </h3>
              {success ? (
                <p className="mt-0.5 text-xs text-emerald-300/80">Akun user telah dihapus permanen.</p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words">
                  Kamu akan menghapus akun{" "}
                  <span className="font-medium text-slate-200">"{user.name}"</span>.
                  Tindakan ini tidak bisa dibatalkan.
                </p>
              )}
            </div>
          </div>

          {!success && (
            <div className="mt-3.5 flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700 disabled:opacity-70 disabled:cursor-wait"
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
          )}
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminUserDeleteModal