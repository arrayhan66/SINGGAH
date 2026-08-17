import { createPortal } from "react-dom"
import {
  LayoutList,
  Plus,
  Search,
  LayoutGrid,
  FolderOpen,
  PackageOpen,
  ChevronDown,
  Check,
} from "lucide-react"
import AdminHeroBackground from "../../../../components/ui/AdminHeroBackground"

const stateTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "used", label: "Berisi Project", icon: FolderOpen },
  { value: "empty", label: "Kosong", icon: PackageOpen },
]

export default function CategoryHero({
  search,
  onSearchChange,
  stateFilter,
  onStateFilterChange,
  stateCounts,
  onAddClick,
  isOpen,
  dropdownPos,
  onToggleDropdown,
  buttonRef,
  panelRef,
  onFilterSelect,
}) {
  const selectedTab =
    stateTabs.find((t) => t.value === stateFilter) || stateTabs[0]
  const SelectedIcon = selectedTab.icon

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-[clamp(0.75rem,0.5rem+1vw,1rem)] sm:gap-5">
          <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
            <LayoutList className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
              Kelola <span className="text-cyan-300">Kategori</span>
            </h1>
            <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
              Atur dan kelompokkan kategori untuk project dan berita mahasiswa
              dengan rapi.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-6 md:px-6 md:pt-7 md:pb-7 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kategori..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="button"
            onClick={onAddClick}
            className="group flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus
              size={16}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span>Tambah Kategori</span>
          </button>
        </div>

        <div className="mt-4">
          <div className="relative w-full min-[550px]:hidden">
            <button
              ref={buttonRef}
              type="button"
              onClick={onToggleDropdown}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
            >
              <span className="flex min-w-0 items-center gap-2">
                <SelectedIcon className="h-4 w-4 shrink-0 text-cyan-300" />
                <span className="truncate">{selectedTab.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {stateCounts[selectedTab.value] !== undefined && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                    {stateCounts[selectedTab.value]}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {isOpen &&
              dropdownPos &&
              createPortal(
                <div
                  ref={panelRef}
                  role="listbox"
                  style={{
                    position: "fixed",
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                  }}
                  className="z-50 min-w-[200px] animate-fade-in-up overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  {stateTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = stateFilter === tab.value
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => onFilterSelect(tab.value)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-cyan-300" : "text-slate-500"
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {tab.label}
                        </span>
                        {stateCounts[tab.value] !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-white/[0.07] text-slate-400"
                            }`}
                          >
                            {stateCounts[tab.value]}
                          </span>
                        )}
                        {isActive && (
                          <Check className="h-4 w-4 shrink-0 text-cyan-400" />
                        )}
                      </button>
                    )
                  })}
                </div>,
                document.body,
              )}
          </div>

          <div className="hidden min-[550px]:flex min-[550px]:w-fit min-[550px]:flex-wrap min-[550px]:items-center min-[550px]:gap-1 rounded-xl border border-white/10 bg-white/5 min-[550px]:p-1">
            {stateTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = stateFilter === tab.value
              const count = stateCounts[tab.value]
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onStateFilterChange(tab.value)}
                  className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-white shadow-sm ring-1 ring-cyan-400/30"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-cyan-300" : "text-slate-500"
                    }`}
                  />
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                        isActive
                          ? "bg-cyan-500/25 text-cyan-300"
                          : "bg-white/[0.07] text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </AdminHeroBackground>
  )
}
