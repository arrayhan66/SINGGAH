import { useEffect, useState, useCallback, useRef } from "react"

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
  // Penutup "sedang menutup" harus hidup di ref, bukan di state. Kalau
  // bergantung ke state, setClosing(true) mengubah identitas handleClose,
  // yang memicu ulang efek di bawah, yang baris pertamanya setClosing(false)
  // -- jadi flag-nya hilang di tick yang sama dan animasi keluar tidak pernah
  // jalan (shown = visible && !closing selalu true).
  const closingRef = useRef(false)
  const closeTimerRef = useRef(null)
  const handleCloseRef = useRef(null)

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
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    closeTimerRef.current = setTimeout(() => onClose?.(), 250)
  }, [onClose])

  useEffect(() => {
    handleCloseRef.current = handleClose
  }, [handleClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Efek animasi masuk sengaja hanya bergantung ke `show`. Kalau
  // handleClose ikut jadi dependensi dan pemanggilnya membuat fungsi inline
  // (AnnouncementModal begitu), efek ini jalan ulang tiap render --
  // termasuk tiap ketikan di dalam form -- dan memutar ulang animasi masuk
  // di tengah pengguna mengetik.
  useEffect(() => {
    if (!show) return
    closingRef.current = false
    setClosing(false)
    setVisible(false)
    setProgress(100)
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [show])

  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === "Escape" && closeOnEscape) handleCloseRef.current?.()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [show, closeOnEscape])

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
        handleCloseRef.current?.()
      }
    }, 30)
    return () => clearInterval(tick)
  }, [show, position, autoDismiss, duration])

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
      onClick={(e) => {
        if (isCentered && e.target === e.currentTarget) handleClose()
      }}
      className={`fixed inset-0 z-[100] flex p-4 pt-12 sm:p-6 ${wrapperClass} ${
        isCentered ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
      }`}
    >
      <div
        className={`pointer-events-auto w-full ${
          isCentered
            ? "max-w-2xl sm:max-w-3xl 5xl:max-w-[1400px] 6xl:max-w-[1600px]"
            : "max-w-sm sm:max-w-md"
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
