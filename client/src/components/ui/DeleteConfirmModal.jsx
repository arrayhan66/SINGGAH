import { useEffect, useState } from "react"
import { Trash2, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import PopupToast from "./PopupToast"

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
    setVisible(false)
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    if (externalSuccess) {
      const timer = setTimeout(() => handleClose(), 1200)
      return () => clearTimeout(timer)
    }
  }, [externalSuccess])

  function handleClose() {
    setClosing(true)
    setTimeout(() => onCancel?.(), 250)
  }

  return (
    <PopupToast show variant={externalSuccess ? "success" : "danger"} onClose={handleClose} position={externalSuccess ? "top-right" : "center"} duration={1200}>
      <div className={`px-4 py-3.5 transition-all duration-300 ${visible && !closing ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            externalSuccess ? "bg-emerald-500/20 border-emerald-500/30" : "bg-red-500/20 border-red-500/30"
          }`}>
            {externalSuccess ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            ) : (
              <Trash2 className="h-4.5 w-4.5 text-red-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className={`pt-1 text-sm font-semibold ${externalSuccess ? "text-emerald-300" : "text-white"}`}>
              {externalSuccess ? "Berhasil Dihapus!" : title}
            </h3>
            {externalSuccess ? (
              <p className="mt-0.5 text-xs text-emerald-300/80">Data telah dihapus permanen.</p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{message}</p>
            )}
          </div>
        </div>

        {!externalSuccess && (
          <>
            <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 ml-12">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={externalLoading}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={externalLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
              >
                {externalLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </PopupToast>
  )
}

export default DeleteConfirmModal