import { useProgress } from "@react-three/drei"

function LoadingOverlay() {
  const { active, progress } = useProgress()

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0b1220] transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="text-3xl md:text-4xl font-extrabold tracking-wide text-[#7dd3fc]">
        SINGGAH
      </div>
      <div className="text-xs md:text-sm text-[#93b4d4] tracking-[0.3em]">
        MEMPERSIAPKAN VIRTUAL HALL
      </div>
      <div className="w-56 h-1.5 rounded-full bg-[#1e3a5f] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-[#5b7ba0]">{Math.round(progress)}%</div>
    </div>
  )
}

export default LoadingOverlay
