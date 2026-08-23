import { useEffect, useRef, useState } from "react"
import { useTransitionStore } from "../../three/hooks/useTransition"

const NOMINAL_MS = 750
const MAX_WAIT = 8000

function PortalTransitionOverlay() {
  const active = useTransitionStore((s) => s.active)
  const message = useTransitionStore((s) => s.message)
  const runId = useTransitionStore((s) => s.runId)
  const startedAt = useTransitionStore((s) => s.startedAt)
  const [pct, setPct] = useState(0)
  const lastRunRef = useRef(0)

  // `active` flips synchronously with the teleport, so the overlay turns opaque
  // in the same commit — no frame where the destination room shows through.
  const hidden = !active

  // Smooth 0 -> 100 percentage for the whole transition. Reset on every new run.
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      if (lastRunRef.current !== runId) {
        lastRunRef.current = runId
        setPct(0)
      }
      const target = Math.min(100, Math.round(((Date.now() - startedAt) / NOMINAL_MS) * 100))
      setPct((prev) => (target > prev ? target : prev))
    }, 60)
    return () => clearInterval(id)
  }, [active, startedAt, runId])

  // Safety net: force the transition to end if the store timer never fires.
  useEffect(() => {
    const t = setTimeout(() => useTransitionStore.getState().end(), MAX_WAIT)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-night ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-3xl md:text-4xl font-extrabold tracking-wide text-sky-300">
        SINGGAH
      </div>
      <div className="text-xs md:text-sm text-night-muted tracking-[0.3em]">{message}</div>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/50" />
      <div className="text-xs md:text-sm tabular-nums text-night-dim">{pct}%</div>
    </div>
  )
}

export default PortalTransitionOverlay
