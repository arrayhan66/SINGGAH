import { useEffect, useState } from "react"
import { useTransitionStore } from "../../three/hooks/useTransition"

const MIN_DURATION = 800
const SETTLE_MS = 150

function PortalTransitionOverlay() {
  const active = useTransitionStore((s) => s.active)
  const message = useTransitionStore((s) => s.message)
  const runId = useTransitionStore((s) => s.runId)
  const startedAt = useTransitionStore((s) => s.startedAt)
  const [display, setDisplay] = useState(0)
  const [lastRun, setLastRun] = useState(runId)
  const [hidden, setHidden] = useState(true)

  if (runId !== lastRun) {
    setLastRun(runId)
    setDisplay(0)
  }

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setHidden(false), 0)
    return () => clearTimeout(t)
  }, [active])

  useEffect(() => {
    if (active || hidden) return
    const t = setTimeout(() => setHidden(true), SETTLE_MS)
    return () => clearTimeout(t)
  }, [active, hidden])

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setDisplay(Math.min(100, Math.round(((Date.now() - startedAt) / MIN_DURATION) * 100)))
    }, 30)
    return () => clearInterval(id)
  }, [active, startedAt, runId])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0b1220] transition-opacity duration-300 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full rounded-full bg-cyan-400/10 blur-xl" />
          <div className="absolute h-12 w-12 animate-ping rounded-full border-2 border-cyan-400/30" />
          <div className="absolute h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/50 [animation-duration:1.2s]" />
        </div>
        <div className="text-3xl md:text-4xl font-extrabold tracking-wide text-[#7dd3fc]">
          SINGGAH
        </div>
      </div>
      <div className="text-xs md:text-sm text-[#93b4d4] tracking-[0.3em]">{message}</div>
      <div className="w-56 h-1.5 rounded-full bg-[#1e3a5f] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] transition-all duration-150"
          style={{ width: `${display}%` }}
        />
      </div>
      <div className="text-xs text-[#5b7ba0]">{display}%</div>
    </div>
  )
}

export default PortalTransitionOverlay
