import { createPortal } from "react-dom"
import {
  Image,
  Upload,
  Search,
  Grid3X3,
  List,
  FileText,
  LayoutGrid,
  ChevronDown,
  Loader2,
  Files,
  Database,
  Check,
} from "lucide-react"
import AdminHeroBackground from "../../../../components/ui/AdminHeroBackground"

const typeTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "image", label: "Gambar", icon: Image },
  { value: "document", label: "Dokumen", icon: FileText },
]

const iconBgMap = {
  cyan: "bg-cyan-400/15 border-cyan-400/40",
  emerald: "bg-emerald-400/15 border-emerald-400/40",
  blue: "bg-blue-400/15 border-blue-400/40",
  violet: "bg-violet-400/15 border-violet-400/40",
}

const textMap = {
  cyan: "text-cyan-300",
  emerald: "text-emerald-300",
  blue: "text-blue-300",
  violet: "text-violet-300",
}

const gradMap = {
  cyan: "from-cyan-500/20 via-cyan-500/[0.06] to-transparent",
  emerald: "from-emerald-500/20 via-emerald-500/[0.06] to-transparent",
  blue: "from-blue-500/20 via-blue-500/[0.06] to-transparent",
  violet: "from-violet-500/20 via-violet-500/[0.06] to-transparent",
}

const glowMap = {
  cyan: "shadow-cyan-500/20",
  emerald: "shadow-emerald-500/20",
  blue: "shadow-blue-500/20",
  violet: "shadow-violet-500/20",
}

export default function MediaLibraryHero({
  stats,
  totalSize,
  typeCounts,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  view,
  onViewChange,
  uploading,
  onUploadClick,
  fileInputRef,
  filterOpen,
  filterPos,
  onToggleFilter,
  filterBtnRef,
  filterPanelRef,
  onFilterSelect,
}) {
  const selectedTypeTab =
    typeTabs.find((t) => t.value === typeFilter) || typeTabs[0]
  const SelectedTypeIcon = selectedTypeTab.icon

  const statCards = [
    {
      key: "total",
      label: "Total File",
      value: stats.total,
      icon: Files,
      color: "cyan",
    },
    {
      key: "images",
      label: "Gambar",
      value: stats.images,
      icon: Image,
      color: "emerald",
    },
    {
      key: "documents",
      label: "Dokumen",
      value: stats.documents,
      icon: FileText,
      color: "blue",
    },
    {
      key: "size",
      label: "Total Ukuran",
      value: totalSize,
      icon: Database,
      color: "violet",
    },
  ]

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="media-stats-bar rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
            <div className="dashboard-hero-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <Image className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Media <span className="text-cyan-300">Library</span>
              </h1>
              <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
                Kelola semua file dan gambar yang diupload.
              </p>
            </div>
          </div>

          <div className="media-stats-grid mt-6 grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1000px]:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.key}
                  className={`media-stat-item group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradMap[stat.color]} px-4 py-4 transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5`}
                >
                  <Icon
                    className={`media-stat-watermark absolute -right-2 -top-2 h-20 w-20 rotate-12 ${textMap[stat.color]} opacity-[0.07] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
                  />
                  <div className="relative flex items-center gap-3.5">
                    <div
                      className={`media-stat-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-lg ${glowMap[stat.color]} ${iconBgMap[stat.color]} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <Icon className={`h-5 w-5 ${textMap[stat.color]}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-2xl font-black text-white leading-tight tabular-nums">
                        {stat.value}
                      </p>
                      <p className="truncate text-xs text-slate-300/80 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 mt-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari file..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:shadow-lg focus:shadow-cyan-500/10"
            />
          </div>
          <div className="flex w-full items-center gap-3 md:w-auto md:shrink-0">
            <div
              className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1"
              role="group"
              aria-label="Tampilan media"
            >
              <button
                onClick={() => onViewChange("list")}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                  view === "list"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan daftar"
                aria-label="Tampilan daftar"
                aria-pressed={view === "list"}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => onViewChange("grid")}
                className={`cursor-pointer rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                  view === "grid"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Tampilan grid"
                aria-label="Tampilan grid"
                aria-pressed={view === "grid"}
              >
                <Grid3X3 size={16} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
              onChange={onUploadClick}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5"
                />
              )}
              {uploading ? "Mengupload..." : "Upload File"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative w-full min-[630px]:hidden">
            <button
              ref={filterBtnRef}
              type="button"
              onClick={onToggleFilter}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
              aria-expanded={filterOpen}
              aria-haspopup="listbox"
            >
              <span className="flex min-w-0 items-center gap-2">
                <SelectedTypeIcon className="h-4 w-4 shrink-0 text-cyan-300" />
                <span className="truncate">{selectedTypeTab.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {typeCounts[selectedTypeTab.value] !== undefined && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                    {typeCounts[selectedTypeTab.value]}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    filterOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {filterOpen &&
              filterPos &&
              createPortal(
                <div
                  ref={filterPanelRef}
                  role="listbox"
                  style={{
                    position: "fixed",
                    top: filterPos.top,
                    left: filterPos.left,
                    width: filterPos.width,
                  }}
                  className="z-50 min-w-[200px] animate-fade-in-up overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  {typeTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = typeFilter === tab.value
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
                        {typeCounts[tab.value] !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-white/[0.07] text-slate-400"
                            }`}
                          >
                            {typeCounts[tab.value]}
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

          <div className="hidden min-[630px]:flex w-fit flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {typeTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = typeFilter === tab.value
              const count = typeCounts[tab.value]
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onTypeFilterChange(tab.value)}
                  className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-white shadow-sm ring-1 ring-cyan-400/30"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                        isActive ? "text-cyan-300" : "text-slate-500"
                      }`}
                    />
                    {tab.label}
                  </span>
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
