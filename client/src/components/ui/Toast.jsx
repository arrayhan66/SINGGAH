import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

const DURATION = 3000

const typeConfig = {
  success: {
    icon: CheckCircle2,
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    barColor: "bg-emerald-400",
    textColor: "text-emerald-300",
  },
  error: {
    icon: XCircle,
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    barColor: "bg-red-400",
    textColor: "text-red-300",
  },
}

export default function Toast({ message, type = "success", onDone }) {
  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(100)
  const config = typeConfig[type] || typeConfig.success
  const Icon = config.icon

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(tick)
        setShow(false)
        setTimeout(() => onDone?.(), 300)
      }
    }, 30)
    return () => clearInterval(tick)
  }, [onDone])

  return (
    <div
      className={`fixed top-20 right-4 z-[100] w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 ${
        show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} bg-brand-dark/95 shadow-2xl backdrop-blur-xl`}
      >
        {/* Accent bar */}
        <div className={`h-0.5 w-full ${config.barColor} opacity-60`} />

        <div className="flex items-start gap-3 px-4 py-3.5">
          {/* Icon */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconBg} border ${config.border}`}
          >
            <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} />
          </div>

          {/* Text */}
          <p className={`min-w-0 flex-1 pt-1.5 text-sm font-medium leading-snug ${config.textColor}`}>
            {message}
          </p>

          {/* Close */}
          <button
            onClick={() => {
              setShow(false)
              setTimeout(() => onDone?.(), 300)
            }}
            className="shrink-0 cursor-pointer text-slate-500 transition-colors hover:text-white pt-1"
          >
            <X size={14} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/5">
          <div
            className={`h-full transition-none ${config.barColor} opacity-40`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
