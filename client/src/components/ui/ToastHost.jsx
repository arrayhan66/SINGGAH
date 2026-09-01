import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import PopupToast from "./PopupToast"
import toast from "../../utils/toast"

function ToastHost() {
  const [item, setItem] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    toast.setListener((next) => {
      setItem(next)
      setVisible(true)
    })
    return () => toast.setListener(null)
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(t)
  }, [visible, item])

  if (!item) return null

  const isError = item.type !== "success"

  return (
    <PopupToast
      show={visible}
      variant={isError ? "danger" : "success"}
      position="top-right"
      duration={4500}
      onClose={() => setVisible(false)}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isError
                ? "border-red-500/30 bg-red-500/20"
                : "border-emerald-500/30 bg-emerald-500/20"
            }`}
          >
            {isError ? (
              <AlertCircle className="h-4.5 w-4.5 text-red-400" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className={`pt-1 text-sm font-semibold ${
                isError ? "text-white" : "text-emerald-300"
              }`}
            >
              {isError ? "Terjadi Kesalahan" : "Berhasil"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
              {item.message}
            </p>
          </div>
        </div>
      </div>
    </PopupToast>
  )
}

export default ToastHost
