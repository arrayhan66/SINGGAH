import { Sun, Moon } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      onClick={toggleTheme}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 transition-all duration-300 hover:border-blue-300 hover:bg-blue-100 min-[350px]:h-9 min-[350px]:w-9 sm:h-10 sm:w-10 dark:text-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-300 dark:hover:border-cyan-400/30 dark:hover:bg-blue-50 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300"
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
    >
      {isDark ? (
        <Sun size={16} className="w-3.5 h-3.5 min-[350px]:w-4 min-[350px]:h-4 sm:w-[18px] sm:h-[18px]" />
      ) : (
        <Moon size={16} className="w-3.5 h-3.5 min-[350px]:w-4 min-[350px]:h-4 sm:w-[18px] sm:h-[18px]" />
      )}
    </button>
  )
}
