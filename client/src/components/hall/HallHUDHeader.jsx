import { ArrowLeft, Frame, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function HallHUDHeader({ area }) {
  const navigate = useNavigate()

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between pl-4 py-4 pr-4 md:pr-6 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-start gap-2">
        <div className="flex items-center space-x-3 rounded-2xl border border-night-border bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Frame className="w-5 h-5 text-night-text" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-sky-300">
              SINGGAH Virtual Hall 3D
            </h1>
            <p className="flex items-center space-x-1 text-[10px] leading-tight text-night-muted">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{area}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2.5 rounded-2xl border border-night-border bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-sky-400/50 hover:bg-sky-500/15 hover:shadow-[0_8px_30px_-8px_rgba(56,189,248,0.45)] hover:scale-[1.03] active:scale-95 cursor-pointer"
          aria-label="Kembali ke Beranda"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/20 transition-colors duration-300 group-hover:border-sky-300/60 group-hover:bg-sky-400/30">
            <ArrowLeft className="w-4 h-4 text-sky-300 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-white" />
          </span>
          <span className="text-xs font-semibold text-night-muted transition-colors duration-300 group-hover:text-white">
            Kembali
          </span>
        </button>
      </div>
    </header>
  )
}
