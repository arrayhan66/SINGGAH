import { useEffect, useState, useCallback } from "react"

function PopupToast({
  children,
  show = true,
  variant = "default",
  onClose,
  closeOnEscape = true,
  position = "top-right",
  autoDismiss = true,
  duration = 3000,
}) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [progress, setProgress] = useState(100)

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

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    setTimeout(() => onClose?.(), 250)
  }, [closing, onClose])

  useEffect(() => {
    if (!show) return
    setClosing(false)
    setVisible(false)
    setProgress(100)
    requestAnimationFrame(() => setVisible(true))

    const onKey = (e) => {
      if (e.key === "Escape" && closeOnEscape) handleClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [show, closeOnEscape, handleClose])

  useEffect(() => {
    if (!show || position === "center" || !autoDismiss) return
    const start = Date.now()
    setProgress(100)
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(tick)
        handleClose()
      }
    }, 30)
    return () => clearInterval(tick)
  }, [show, position, autoDismiss, duration, handleClose])

  if (!show) return null

  const isCentered = position === "center"
  const shown = visible && !closing
  const isTopRight = position !== "center"

  const wrapperClass = isCentered
    ? "items-center justify-center"
    : "items-start justify-center sm:justify-end"

  const innerAnim = shown
    ? "translate-x-0 translate-y-0 opacity-100"
    : isCentered
      ? "translate-y-4 opacity-0"
      : "-translate-y-4 opacity-0"

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] flex p-4 pt-12 sm:p-6 ${wrapperClass}`}
    >
      <div
        className={`pointer-events-auto w-full ${
          isCentered ? "max-w-lg" : "max-w-sm sm:max-w-md"
        }`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border ${config.border} bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${innerAnim}`}
        >
          <div className={`h-0.5 w-full ${config.bar} opacity-60`} />
          {children}
          {isTopRight && autoDismiss && (
            <div className="h-0.5 w-full bg-white/5">
              <div
                className={`h-full transition-none ${config.bar} opacity-40`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PopupToast
