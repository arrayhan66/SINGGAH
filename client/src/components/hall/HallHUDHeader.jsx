import { ArrowLeft, Frame, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function HallHUDHeader({ area }) {
  const navigate = useNavigate()

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between pl-4 py-4 pr-4 md:pr-6 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-start gap-2">
        <div className="flex items-center space-x-3 rounded-2xl border border-[#223047] bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Frame className="w-5 h-5 text-[#eaf2fc]" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-[#7dd3fc]">
              SINGGAH Virtual Hall 3D
            </h1>
            <p className="flex items-center space-x-1 text-[10px] leading-tight text-[#93b4d4]">
              <MapPin className="w-3 h-3 text-[#38bdf8]" />
              <span>{area}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2.5 rounded-2xl border border-[#223047] bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_8px_25px_-8px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-95 cursor-pointer"
          aria-label="Kembali ke Beranda"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/15">
            <ArrowLeft className="w-4 h-4 text-[#93b4d4] transition-all duration-300 group-hover:-translate-x-1 group-hover:text-white" />
          </span>
          <span className="text-xs font-semibold text-[#93b4d4] transition-colors duration-300 group-hover:text-white">
            Kembali
          </span>
        </button>
      </div>
    </header>
  )
}
