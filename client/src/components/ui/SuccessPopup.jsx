import { CheckCircle } from "lucide-react"
import PopupToast from "./PopupToast"

function SuccessPopup({
  isOpen,
  title = "Berhasil!",
  message = "Password akun Anda telah berhasil diubah.",
}) {
  return (
    <PopupToast show={isOpen} variant="success" onClose={() => {}} duration={2500}>
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-emerald-300">{title}</h3>
            <p className="mt-0.5 text-xs text-emerald-300/80">{message}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
        </div>
      </div>
    </PopupToast>
  )
}

export default SuccessPopup