import { useEffect } from "react"
import { X } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { usePlantInfoStore } from "../../three/hooks/usePlantInfo"
import { useWalkStore } from "../../three/hooks/useWalk"


function PlantInfoModal() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const info = usePlantInfoStore((s) => s.info)
  const close = () => usePlantInfoStore.getState().close()

  // Bekukan gerakan pemain selama popup terbuka (sama seperti modal karya).
  useEffect(() => {
    useWalkStore.getState().setLocked(Boolean(info))
    if (!info) return
    const onKey = (e) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [info])

  if (!info) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md ${
        isDark ? "bg-black/70" : "bg-slate-900/30"
      }`}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Info tanaman"
        className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-3xl border p-8 shadow-2xl ${
          isDark
            ? "border-sky-700/60 bg-gradient-to-b from-sky-950 via-slate-950 to-sky-950"
            : "border-sky-200/80 bg-gradient-to-b from-white via-slate-50 to-sky-50"
        }`}
      >
        <button
          onClick={close}
          aria-label="Tutup informasi"
          className={`absolute top-5 right-5 w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? "bg-sky-900/60 hover:bg-sky-800 border-sky-700/50 text-white"
              : "bg-sky-100 hover:bg-sky-200 border-sky-200 text-sky-700"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <p
          className={`text-[11px] font-bold uppercase tracking-[0.24em] mb-2 ${
            isDark ? "text-sky-400/90" : "text-sky-600"
          }`}
        >
          {info.category ? `Tentang ${info.category}` : "Tentang Tanaman"}
        </p>

        <h3
          className={`text-2xl md:text-3xl font-extrabold mb-3 ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {info.title}
        </h3>

        <p
          className={`text-sm leading-relaxed ${
            isDark ? "text-slate-100/85" : "text-slate-700"
          }`}
        >
          {info.text}
        </p>
      </div>
    </div>
  )
}

export default PlantInfoModal