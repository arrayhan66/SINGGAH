import { useTheme } from "../../context/ThemeContext"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`relative hidden h-7 w-[52px] shrink-0 cursor-pointer items-center overflow-hidden rounded-full border p-0.5 transition-[border-color,box-shadow] duration-500 active:scale-95 min-[300px]:inline-flex min-[480px]:h-9 min-[480px]:w-[68px] sm:h-10 sm:w-[76px] focus-visible:outline-none ${
        isDark
          ? "border-white/10 shadow-[0_4px_12px_rgba(2,6,23,.5)] focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          : "border-white/60 shadow-[0_4px_12px_rgba(2,132,199,.25)] focus-visible:ring-2 focus-visible:ring-amber-400/80"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-sky-300 shadow-[inset_0_2px_4px_rgba(255,255,255,.65),inset_0_-2px_5px_rgba(224,242,254,.85)]"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-night-panel via-night to-night-deep shadow-[inset_0_2px_4px_rgba(255,255,255,.08),inset_0_-3px_8px_rgba(0,0,0,.55)] transition-opacity duration-500 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="absolute left-[12%] top-[24%] h-0.5 w-0.5 animate-pulse rounded-full bg-white/100" />
        <span className="absolute left-[22%] top-[62%] h-1 w-1 animate-pulse rounded-full bg-white/90 [animation-delay:400ms]" />
        <span className="absolute left-[34%] top-[30%] h-0.5 w-0.5 rounded-full bg-white/80 [animation-delay:800ms]" />
        <span className="absolute left-[40%] top-[68%] h-0.5 w-0.5 rounded-full bg-white/70" />
        <span className="absolute left-[52%] top-[14%] h-0.5 w-0.5 rounded-full bg-white/60 [animation-delay:1200ms]" />
      </span>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-all duration-500 ${
          isDark ? "translate-x-1 opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <span className="absolute left-[46%] top-[18%] h-3 w-7 animate-[pulse_4s_ease-in-out_infinite]">
          <span className="absolute bottom-0 left-0 h-[5px] w-full rounded-full bg-gradient-to-b from-white via-white to-sky-200/80 shadow-[0_1px_2px_rgba(3,105,161,.3)]" />
          <span className="absolute bottom-[3px] left-[14%] h-[9px] w-[9px] rounded-full bg-white/100" />
          <span className="absolute bottom-[4px] right-[10%] h-[6px] w-[6px] rounded-full bg-white/95" />
        </span>
        <span className="absolute right-[4%] top-[34%] h-3.5 w-8 animate-[pulse_4s_ease-in-out_infinite] [animation-delay:1.3s]">
          <span className="absolute bottom-0 left-0 h-[6px] w-full rounded-full bg-gradient-to-b from-white via-white to-sky-200/70 shadow-[0_1px_3px_rgba(3,105,161,.35)]" />
          <span className="absolute bottom-[4px] left-[16%] h-[11px] w-[11px] rounded-full bg-white/100" />
          <span className="absolute bottom-[5px] right-[14%] h-[7px] w-[7px] rounded-full bg-white/95" />
        </span>
        <span className="absolute bottom-[10%] left-[58%] h-2 w-4 animate-[pulse_4s_ease-in-out_infinite] [animation-delay:2.6s]">
          <span className="absolute bottom-0 left-0 h-[4px] w-full rounded-full bg-white/90 shadow-[0_1px_2px_rgba(3,105,161,.25)]" />
          <span className="absolute bottom-[2px] left-[24%] h-[6px] w-[6px] rounded-full bg-white/90" />
        </span>
      </span>

      <span
        className={`relative z-10 block h-6 w-6 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] min-[480px]:h-8 min-[480px]:w-8 sm:h-9 sm:w-9 ${
          isDark ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fef08a,#facc15_55%,#f59e0b)] shadow-[0_0_12px_4px_rgba(253,224,71,.65),0_2px_8px_rgba(234,88,12,.45),inset_0_-3px_6px_rgba(245,158,11,.6)] transition-all duration-500 ${
            isDark ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#f8fafc,#cbd5e1_60%,#94a3b8)] shadow-[0_2px_8px_rgba(2,6,23,.6),inset_0_-3px_6px_rgba(71,85,105,.5)] transition-all duration-500 ${
            isDark ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <span className="absolute left-[18%] top-[16%] h-[24%] w-[24%] rounded-full bg-slate-500/40 blur-[1px]" />
          <span className="absolute right-[14%] top-[46%] h-[17%] w-[17%] rounded-full bg-slate-500/35 blur-[0.5px]" />
          <span className="absolute bottom-[12%] left-[34%] h-[14%] w-[14%] rounded-full bg-slate-500/30" />
          <span className="absolute right-[20%] top-[16%] h-[11%] w-[11%] rounded-full bg-slate-500/30" />
          <span className="absolute left-[12%] bottom-[32%] h-[9%] w-[9%] rounded-full bg-slate-500/28" />
          <span className="absolute left-[52%] top-[38%] h-[8%] w-[8%] rounded-full bg-slate-500/25" />
        </span>
      </span>
    </button>
  )
}
