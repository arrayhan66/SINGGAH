import { useEffect, useState } from "react"
import { AlertTriangle, X, CheckCircle2, Loader2 } from "lucide-react"

function AdminBeritaDeleteModal({ berita, onConfirm, onCancel, loading = false, success = false }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!berita) return
    setClosing(false)
    setVisible(false)
    document.body.style.overflow = "hidden"
    requestAnimationFrame(() => setVisible(true))
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [berita])

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

  if (!berita) return null

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
            : "border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark shadow-black/30"
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
              className={`text-slate-400 cursor-pointer hover:text-white transition-colors ${loading ? "opacity-40 pointer-events-none" : ""}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-base md:text-lg font-semibold text-white transition-colors duration-300">
            {success ? "Berhasil Dihapus!" : "Hapus Berita?"}
          </h3>

          {/* Message */}
          {success ? (
            <p className="mt-2 text-sm text-emerald-300/80 animate-fade-in">
              Berita telah dihapus permanen dari daftar.
            </p>
          ) : (
            <p className="mt-2 text-xs md:text-sm text-slate-400 min-w-0 break-words">
              Kamu akan menghapus{" "}
              <span className="font-medium text-slate-200">"{berita.title}"</span>.
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
                  className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/40 transition-all disabled:opacity-70 disabled:cursor-wait"
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

export default AdminBeritaDeleteModal
