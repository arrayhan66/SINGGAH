import { Palette } from "lucide-react"
import { toggleClass, getSwitchClass } from "../../../../utils/settingsHelpers"
import { useTheme } from "../../../../context/ThemeContext"

export default function SettingsGeneral({ form, onChange }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-colors ${
          isDark
            ? "border-white/10 bg-white/[0.04] hover:border-white/20"
            : "border-slate-200 bg-white shadow-sm hover:border-amber-300"
        }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isDark
              ? "border border-amber-400/25 bg-amber-400/10"
              : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25"
          }`}
        >
          <Palette
            className={`h-6 w-6 ${isDark ? "text-amber-300" : "text-white"}`}
          />
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Mode Maintenance
          </p>
          <p
            className={`mt-0.5 text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Nonaktifkan akses publik ke website sementara waktu
          </p>
        </div>
        <label className={`${toggleClass} shrink-0`}>
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={form.maintenanceMode}
            onChange={onChange}
            className="peer sr-only"
          />
          <div className={getSwitchClass(isDark)} />
        </label>
      </div>
    </div>
  )
}