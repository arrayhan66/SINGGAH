import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, ArrowRight } from "lucide-react"
import PopupToast from "./PopupToast"

const AUTO_REDIRECT_SECONDS = 5

function SubmitSuccessModal({
  isOpen,
  karyaTitle = "",
  redirectPath = "/my-karya",
  mode = "edit",
  onClose,
}) {
  const navigate = useNavigate()
  const [count, setCount] = useState(AUTO_REDIRECT_SECONDS)

  useEffect(() => {
    if (!isOpen) return
    setCount(AUTO_REDIRECT_SECONDS)
    const ticker = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000)
    const redirectTimer = setTimeout(() => navigate(redirectPath), AUTO_REDIRECT_SECONDS * 1000)
    return () => { clearInterval(ticker); clearTimeout(redirectTimer) }
  }, [isOpen, navigate, redirectPath])

  if (!isOpen) return null

  const headline = mode === "upload" ? "Karya Berhasil Diunggah" : "Karya Berhasil Diperbarui"

  return (
    <PopupToast show={isOpen} variant="success" onClose={onClose} duration={5000}>
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 border border-cyan-400/30">
            <CheckCircle2 className="h-4.5 w-4.5 text-cyan-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">{headline}</h3>
            <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words line-clamp-2">"{karyaTitle}"</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => navigate(redirectPath)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            Lihat Karya <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2.5 text-center text-[11px] text-slate-500">
          Auto redirect dalam <span className="font-semibold text-cyan-300">{count}</span> detik
        </p>
      </div>
    </PopupToast>
  )
}

export default SubmitSuccessModal