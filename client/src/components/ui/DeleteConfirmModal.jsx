import { useEffect, useState } from "react"
import { Trash2, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

function DeleteConfirmModal({
  title = "Yakin ingin menghapus?",
  message,
  confirmLabel = "Ya, Hapus",
  onConfirm,
  onCancel,
  loading: externalLoading = false,
  success: externalSuccess = false,
}) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => setVisible(true))
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  useEffect(() => {
    if (externalSuccess) {
      const timer = setTimeout(() => handleClose(), 1200)
      return () => clearTimeout(timer)
    }
  }, [externalSuccess])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onCancel?.(), 300)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !externalLoading) {
      handleClose()
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-4 transition-all duration-300 ${
        visible && !closing ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`w-full max-w-[calc(100vw-2rem)] sm:max-w-sm overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-brand-navy to-brand-dark shadow-2xl shadow-red-500/10 transition-all duration-300 ${
          visible && !closing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Top accent bar */}
        <div className={`h-1 w-full transition-all duration-500 ${
          externalSuccess
            ? "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500"
            : "bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
        }`} />

        <div className="p-5 sm:p-7">
          {/* Icon */}
          <div className="flex items-center gap-3">
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
              externalSuccess
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}>
              {externalSuccess ? (
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 animate-success-pop" />
              ) : (
                <>
                  <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
                    <AlertTriangle className="h-3 w-3 text-red-300" />
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={!externalLoading ? handleClose : undefined}
              className={`ml-auto text-slate-500 hover:text-white transition-colors cursor-pointer ${externalLoading ? "opacity-40 pointer-events-none" : ""}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-white leading-snug transition-colors duration-300">
            {externalSuccess ? "Berhasil Dihapus!" : title}
          </h3>

          {/* Message */}
          {message && !externalSuccess && (
            <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
              {message}
            </p>
          )}

          {externalSuccess && (
            <p className="mt-2.5 text-sm text-emerald-300/80 leading-relaxed animate-fade-in">
              Project telah dihapus permanen dari daftar.
            </p>
          )}

          {/* Warning */}
          {!externalSuccess && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Semua data yang terkait akan hilang secara permanen.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 sm:mt-7 flex gap-3">
            {!externalSuccess && (
              <button
                type="button"
                onClick={handleClose}
                disabled={externalLoading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                Batal
              </button>
            )}
            {!externalSuccess && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={externalLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/40 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-wait"
              >
                {externalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
