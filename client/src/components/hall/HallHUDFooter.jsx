import { MousePointerClick, DoorOpen, Frame, Eye } from "lucide-react"

export default function HallHUDFooter() {
  return (
    <footer className="absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl border border-[#223047] bg-black/50 px-5 py-2.5 text-[11px] md:text-xs text-[#93b4d4] backdrop-blur-md shadow-xl">
        <span className="flex items-center space-x-1.5">
          <Eye className="w-4 h-4 text-[#38bdf8]" />
          <span>Drag untuk melihat-lihat</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <MousePointerClick className="w-4 h-4 text-[#38bdf8]" />
          <span>WASD / klik lantai untuk berjalan</span>
        </span>
        <span className="hidden sm:flex items-center space-x-1.5">
          <DoorOpen className="w-4 h-4 text-[#38bdf8]" />
          <span>Jalan lewat portal biru untuk pindah ruang</span>
        </span>
        <span className="hidden md:flex items-center space-x-1.5">
          <Frame className="w-4 h-4 text-[#38bdf8]" />
          <span>Klik lukisan untuk detail karya</span>
        </span>
      </div>
    </footer>
  )
}
