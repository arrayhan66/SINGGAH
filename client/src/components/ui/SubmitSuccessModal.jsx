import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, ArrowRight, X } from "lucide-react"

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
  const [prevOpen, setPrevOpen] = useState(isOpen)

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    setCount(AUTO_REDIRECT_SECONDS)
  }

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = "hidden"

    const ticker = setInterval(() => {
      setCount((c) => Math.max(0, c - 1))
    }, 1000)

    const redirectTimer = setTimeout(() => {
      navigate(redirectPath)
    }, AUTO_REDIRECT_SECONDS * 1000)

    return () => {
      clearInterval(ticker)
      clearTimeout(redirectTimer)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, navigate, redirectPath])

  if (!isOpen) return null

  const headline =
    mode === "upload" ? "Karya Berhasil Diunggah" : "Karya Berhasil Diperbarui"
  const label =
    mode === "upload" ? "Karya baru telah tayang" : "Karya yang diperbarui"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-brand-dark/85 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md animate-modal-in">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark shadow-2xl shadow-cyan-500/10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="relative flex flex-col items-center px-6 pb-7 pt-10 text-center sm:px-8">
            <div className="relative">
              <div className="absolute inset-0 -m-4 rounded-full bg-cyan-400/20 blur-2xl animate-fade-in" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[3px] shadow-lg shadow-cyan-500/30">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-navy">
                  <svg
                    viewBox="0 0 40 40"
                    className="h-11 w-11"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      className="animate-spark-draw"
                    />
                    <path
                      d="M13 20.5l5 5 9-11"
                      stroke="#22d3ee"
                      strokeWidth="3.5"
                      className="animate-spark-draw"
                      style={{ animationDelay: "0.35s" }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-xl font-black text-white sm:text-2xl">
              {headline}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Perubahan berhasil tersimpan dan langsung tampil di halaman
              karyamu.
            </p>

            <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 break-words text-sm font-semibold leading-snug text-white">
                    "{karyaTitle}"
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 flex w-full flex-col gap-2.5">
              <button
                type="button"
                onClick={() => navigate(redirectPath)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500"
              >
                Lihat Karya Saya
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <p className="mt-5 text-[11px] text-slate-500">
              Otomatis dialihkan dalam{" "}
              <span className="font-semibold text-cyan-300">{count}</span> detik
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitSuccessModal
