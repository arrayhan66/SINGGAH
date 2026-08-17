import { useEffect, useState } from "react"
import { AlertTriangle, X, CheckCircle2, Loader2 } from "lucide-react"

function AdminUserDeleteModal({ user, onConfirm, onCancel, loading = false, success = false }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!user) return
    setClosing(false)
    setVisible(false)
    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => setVisible(true))
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [user])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => handleClose(), 1200)
      return () => clearTimeout(timer)
    }
  }, [success])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onCancel?.(), 300)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !loading) {
      handleClose()
    }
  }

  if (!user) return null

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 transition-all duration-300 ${
        visible && !closing ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
          success
            ? "border-emerald-500/20 bg-gradient-to-b from-brand-navy to-brand-dark shadow-emerald-500/10"
            : "border-white/[0.06] bg-gradient-to-b from-brand-navy to-brand-dark shadow-black/30"
        } ${
          visible && !closing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Top accent bar */}
        <div className={`h-1 w-full transition-all duration-500 ${
          success
            ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"
            : "bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
        }`} />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-start justify-between gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
              success
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              {success ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-success-pop" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <button
              type="button"
              onClick={!loading ? handleClose : undefined}
              className={`cursor-pointer text-slate-400 transition-colors hover:text-white ${loading ? "opacity-40 pointer-events-none" : ""}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-base font-semibold text-white md:text-lg transition-colors duration-300">
            {success ? "Berhasil Dihapus!" : "Hapus User?"}
          </h3>

          {/* Message */}
          {success ? (
            <p className="mt-2 text-sm text-emerald-300/80 animate-fade-in">
              Akun user telah dihapus permanen.
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-400 min-w-0 break-words md:text-sm">
              Kamu akan menghapus akun{" "}
              <span className="font-medium text-slate-200">"{user.name}"</span>.
              Tindakan ini tidak bisa dibatalkan.
            </p>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            {!success && (
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700 disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserDeleteModal
