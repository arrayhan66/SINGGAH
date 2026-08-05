import { useEffect, useState } from "react"
import { useTransitionStore } from "../../three/hooks/useTransition"

function PortalTransitionOverlay() {
  const active = useTransitionStore((s) => s.active)
  const message = useTransitionStore((s) => s.message)
  const runId = useTransitionStore((s) => s.runId)
  const [progress, setProgress] = useState(0)
  const [lastRun, setLastRun] = useState(runId)

  if (runId !== lastRun) {
    setLastRun(runId)
    setProgress(0)
  }

  useEffect(() => {
    if (!active) return
    const duration = 950
    const started = Date.now()
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / duration) * 100))
      setProgress(p)
      if (p >= 100) clearInterval(id)
    }, 60)
    return () => clearInterval(id)
  }, [active, runId])

  return (
    <div
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-[#0b1220]/95 backdrop-blur-sm transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#38bdf8] border-t-transparent" />
        <div className="text-xl md:text-2xl font-extrabold tracking-wide text-[#7dd3fc]">
          SINGGAH
        </div>
      </div>
      <div className="text-xs md:text-sm text-[#93b4d4] tracking-[0.3em]">{message}</div>
      <div className="w-56 h-1.5 rounded-full bg-[#1e3a5f] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-[#5b7ba0]">{progress}%</div>
    </div>
  )
}

export default PortalTransitionOverlay
