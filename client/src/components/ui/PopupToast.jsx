import { useEffect, useState } from "react"

function PopupToast({
  children,
  show = true,
  variant = "default",
  onClose,
  closeOnEscape = true,
}) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  const variantConfig = {
    default: {
      border: "border-white/[0.06]",
      bar: "bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500",
    },
    success: {
      border: "border-emerald-500/30",
      bar: "bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500",
    },
    danger: {
      border: "border-red-500/30",
      bar: "bg-gradient-to-r from-red-500 via-orange-500 to-red-500",
    },
  }

  const config = variantConfig[variant] || variantConfig.default

  useEffect(() => {
    if (!show) return
    setClosing(false)
    setVisible(false)
    requestAnimationFrame(() => setVisible(true))

    const onKey = (e) => {
      if (e.key === "Escape" && closeOnEscape) handleClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [show, closeOnEscape])

  function handleClose() {
    if (closing) return
    setClosing(true)
    setTimeout(() => onClose?.(), 250)
  }

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-start justify-end p-4 sm:p-6">
      <div className="pointer-events-auto w-full max-w-sm">
        <div
          className={`relative overflow-hidden rounded-2xl border ${config.border} bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
            visible && !closing
              ? "translate-x-0 opacity-100"
              : "translate-x-8 opacity-0"
          }`}
        >
          <div className={`h-0.5 w-full ${config.bar} opacity-60`} />
          {children}
        </div>
      </div>
    </div>
  )
}

export default PopupToast