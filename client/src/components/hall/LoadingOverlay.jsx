import { useEffect, useRef, useState } from "react"
import { useProgress } from "@react-three/drei"
import { useTransitionStore } from "../../three/hooks/useTransition"
import useTvReady from "../../three/hooks/useTvReady"

const NOMINAL_MS = 5000
const CAP_LOADING = 98
const MIN_VISIBLE = 800
const MAX_WAIT = 15000

function LoadingOverlay({ ready = false }) {
  const { active, loaded, total } = useProgress()
  // The hall TV video is loaded outside the drei loader, so it counts as one
  // extra asset: the overlay only opens when every asset AND the TV are done.
  const tvReady = useTvReady()
  const [pct, setPct] = useState(0)
  const [hidden, setHidden] = useState(false)

  const mountedAtRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    mountedAtRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (active || total > 0) startedRef.current = true
  }, [active, total])

  // Monotonic 0 -> 100 percentage. The time ramp guarantees the number keeps
  // moving, real progress can pull it forward, and it never goes backwards.
  useEffect(() => {
    const id = setInterval(() => {
      if (hidden) return
      const elapsed = Date.now() - mountedAtRef.current
      const timeTarget = Math.min(CAP_LOADING, (elapsed / NOMINAL_MS) * 100)
      const realTarget =
        total > 0
          ? Math.min(CAP_LOADING, ((loaded + (tvReady ? 1 : 0)) / (total + 1)) * 100)
          : 0
      const target = Math.max(timeTarget, realTarget)
      setPct((prev) => (target > prev ? Math.min(100, Math.round(target)) : prev))
    }, 120)
    return () => clearInterval(id)
  }, [hidden, loaded, total, tvReady])

  // Open only once the hall scene has actually mounted (ready), all assets
  // have finished loading AND the TV video is playable. Snap to 100% right
  // before revealing.
  useEffect(() => {
    if (hidden || !ready) return
    const started = startedRef.current
    const assetsDone = started ? !active && loaded === total : total === 0
    if (!assetsDone || !tvReady) return
    const elapsed = Date.now() - mountedAtRef.current
    const delay = Math.max(0, MIN_VISIBLE - elapsed)
    const t = setTimeout(() => {
      setPct(100)
      setHidden(true)
    }, delay)
    return () => clearTimeout(t)
  }, [active, loaded, total, hidden, ready, tvReady])

  useEffect(() => {
    const t = setTimeout(() => {
      setPct(100)
      setHidden(true)
    }, MAX_WAIT)
    return () => clearTimeout(t)
  }, [])

  // Lock character movement while the hall is still loading.
  useEffect(() => {
    useTransitionStore.getState().setLoading(!hidden)
  }, [hidden])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-night transition-opacity duration-300 ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="text-3xl md:text-4xl font-extrabold tracking-wide text-sky-300">
        SINGGAH
      </div>
      <div className="text-xs md:text-sm text-night-muted tracking-[0.3em]">
        MEMPERSIAPKAN VIRTUAL HALL
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/50" />
      <div className="text-xs md:text-sm tabular-nums text-night-dim">{pct}%</div>
    </div>
  )
}

export default LoadingOverlay
