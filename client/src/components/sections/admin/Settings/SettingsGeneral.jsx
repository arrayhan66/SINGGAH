import { Palette } from "lucide-react"
import { toggleClass, switchClass } from "../../../../utils/settingsHelpers"

export default function SettingsGeneral({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
          <Palette className="h-6 w-6 text-amber-300" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Mode Maintenance</p>
          <p className="mt-0.5 text-xs text-slate-400">
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
          <div className={switchClass} />
        </label>
      </div>
    </div>
  )
}
