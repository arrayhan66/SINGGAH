import { createPortal } from "react-dom"
import { Settings2, ChevronDown, Check } from "lucide-react"
import AdminHeroBackground from "../../../../components/ui/AdminHeroBackground"
import { tabs } from "../../../../utils/settingsHelpers"

export default function SettingsHero({
  activeTab,
  active,
  onSwitchTab,
  menuButtonRef,
  menuRef,
  menuOpen,
  menuPos,
  onToggleMenu,
  onSelectTabFromMenu,
}) {
  const TabIcon = active.icon

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 md:px-6 md:pt-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
          <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 sm:h-16 sm:w-16">
            <Settings2 className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
              Pengaturan <span className="text-cyan-300">Website</span>
            </h1>
            <p className="mt-1 max-w-xl text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400">
              Kelola konfigurasi, identitas visual, dan sistem platform SINGGAH
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 min-[260px]:px-3 pt-8 min-[260px]:pt-8 pb-5 min-[260px]:pb-5 md:px-6 md:pt-10 md:pb-6">
        <div
          role="tablist"
          aria-label="Menu pengaturan"
          className="hidden flex-wrap gap-2 min-[800px]:flex"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => onSwitchTab(tab.id)}
                className={`group relative flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "border-cyan-400/40 bg-gradient-to-b from-cyan-500/[0.18] to-cyan-500/[0.04] text-cyan-200 shadow-lg shadow-cyan-500/15"
                    : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "text-slate-500 group-hover:text-cyan-300"
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span className="tracking-tight">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="min-[800px]:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08]"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/15 text-cyan-300">
                <TabIcon size={15} />
              </span>
              <span className="truncate">{active.label}</span>
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen &&
            menuPos &&
            createPortal(
              <div
                ref={menuRef}
                role="listbox"
                style={{
                  position: "fixed",
                  top: menuPos.top,
                  left: menuPos.left,
                  width: menuPos.width,
                }}
                className="z-50 min-w-[220px] animate-fade-in-up overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => onSelectTabFromMenu(tab.id)}
                      className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-cyan-400/10 text-cyan-300"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isActive
                            ? "bg-cyan-400/15 text-cyan-300"
                            : "text-slate-500"
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {tab.label}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-slate-400 [@media(max-width:600px)]:hidden">
                        {tab.desc}
                      </span>
                      <div className="flex w-4 shrink-0 items-center justify-center">
                        {isActive && (
                          <Check size={16} className="shrink-0 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>,
              document.body,
            )}
        </div>
      </div>
    </AdminHeroBackground>
  )
}
