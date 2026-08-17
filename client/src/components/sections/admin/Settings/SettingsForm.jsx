import { Save, Check } from "lucide-react"
import SettingsGeneral from "./SettingsGeneral"
import SettingsContact from "./SettingsContact"
import SettingsSocial from "./SettingsSocial"
import SettingsSecurity from "./SettingsSecurity"

const tabPanels = {
  general: SettingsGeneral,
  contact: SettingsContact,
  social: SettingsSocial,
  security: SettingsSecurity,
}

export default function SettingsForm({
  activeTab,
  active,
  animDir,
  form,
  loading,
  saving,
  saveError,
  saved,
  onChange,
  onSave,
}) {
  const Panel = tabPanels[activeTab]
  const animClass =
    animDir === "right" ? "animate-slide-right" : "animate-slide-left"
  const TabIcon = active.icon

  return (
    <form onSubmit={onSave} className="mx-auto mt-6 max-w-5xl md:mt-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-xl min-[500px]:p-6 md:p-8">
        <div className="mb-7 flex items-center gap-3.5 border-b border-white/10 pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <TabIcon className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              {active.label}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">{active.desc}</p>
          </div>
        </div>

        <div
          key={activeTab}
          id={`panel-${activeTab}`}
          role="tabpanel"
          className={animClass}
        >
          <Panel form={form} onChange={onChange} />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <button
            type="submit"
            disabled={loading || saving}
            className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-cyan-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save
                size={16}
                className="transition-transform duration-300 group-hover:rotate-12"
              />
            )}
            {loading
              ? "Memuat..."
              : saving
                ? "Menyimpan..."
                : "Simpan Pengaturan"}
          </button>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {saveError && (
              <span className="flex animate-fade-in items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3.5 py-1.5 text-sm font-semibold text-rose-300">
                {saveError}
              </span>
            )}
            {saved && (
              <span className="flex min-w-0 animate-fade-in items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
                  <Check size={12} className="text-emerald-300" />
                </span>
                Pengaturan berhasil disimpan!
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
