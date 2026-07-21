import { Html, useProgress } from "@react-three/drei"

function Loader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="flex flex-col items-center gap-5">
        {/* Ring animasi berlapis */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Glow belakang */}
          <div className="absolute h-full w-full rounded-full bg-cyan-400/10 blur-xl" />

          {/* Ring luar - pulse */}
          <div className="absolute h-24 w-24 animate-ping rounded-full border-2 border-cyan-400/30" />

          {/* Ring tengah - spin lambat berlawanan arah */}
          <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/50 [animation-duration:1.5s]" />

          {/* Ring dalam - spin cepat arah normal */}
          <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-transparent border-b-blue-400 [animation-duration:0.8s]" />

          {/* Persentase di tengah */}
          <span className="text-sm font-bold text-cyan-300">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar tipis */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Label */}
        <p className="text-xs font-medium tracking-wide text-slate-400">
          Menyiapkan model...
        </p>
      </div>
    </Html>
  )
}

export default Loader
