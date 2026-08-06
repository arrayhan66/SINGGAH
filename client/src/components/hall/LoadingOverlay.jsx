import { useEffect, useState } from "react"
import { useProgress } from "@react-three/drei"

const MIN_DURATION = 2000
const MAX_WAIT = 12000

function LoadingOverlay() {
  const { active } = useProgress()
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const started = Date.now()
    const id = setInterval(() => {
      setDisplay(Math.min(100, Math.round(((Date.now() - started) / MIN_DURATION) * 100)))
    }, 30)
    return () => clearInterval(id)
  }, [])

  const ready = display >= 100 && !active

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setDone(true), 400)
    return () => clearTimeout(t)
  }, [ready])

  useEffect(() => {
    const t = setTimeout(() => setDone(true), MAX_WAIT)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0b1220] transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
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
      <div className="text-xs md:text-sm text-[#93b4d4] tracking-[0.3em]">
        MEMPERSIAPKAN VIRTUAL HALL
      </div>
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

export default LoadingOverlay
