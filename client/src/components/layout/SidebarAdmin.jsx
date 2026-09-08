import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  Users,
  Tag,
  Image,
  BarChart3,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const ACCENTS = {
  cyan: {
    bar: "from-cyan-400 to-blue-500",
    tile: "from-cyan-400/20 to-blue-500/10 text-cyan-400 ring-cyan-400/25",
    active: "border-cyan-400/30 bg-cyan-400/10",
    hover: "hover:border-cyan-400/30 hover:bg-cyan-400/10",
    labelHover: "group-hover:text-cyan-300",
  },
  indigo: {
    bar: "from-indigo-400 to-violet-500",
    tile: "from-indigo-400/20 to-violet-500/10 text-indigo-400 ring-indigo-400/25",
    active: "border-indigo-400/30 bg-indigo-400/10",
    hover: "hover:border-indigo-400/30 hover:bg-indigo-400/10",
    labelHover: "group-hover:text-indigo-300",
  },
  sky: {
    bar: "from-sky-400 to-blue-500",
    tile: "from-sky-400/20 to-blue-500/10 text-sky-400 ring-sky-400/25",
    active: "border-sky-400/30 bg-sky-400/10",
    hover: "hover:border-sky-400/30 hover:bg-sky-400/10",
    labelHover: "group-hover:text-sky-300",
  },
  amber: {
    bar: "from-amber-400 to-orange-500",
    tile: "from-amber-400/20 to-orange-500/10 text-amber-400 ring-amber-400/25",
    active: "border-amber-400/30 bg-amber-400/10",
    hover: "hover:border-amber-400/30 hover:bg-amber-400/10",
    labelHover: "group-hover:text-amber-300",
  },
  fuchsia: {
    bar: "from-fuchsia-400 to-pink-500",
    tile: "from-fuchsia-400/20 to-pink-500/10 text-fuchsia-400 ring-fuchsia-400/25",
    active: "border-fuchsia-400/30 bg-fuchsia-400/10",
    hover: "hover:border-fuchsia-400/30 hover:bg-fuchsia-400/10",
    labelHover: "group-hover:text-fuchsia-300",
  },
  emerald: {
    bar: "from-emerald-400 to-teal-500",
    tile: "from-emerald-400/20 to-teal-500/10 text-emerald-400 ring-emerald-400/25",
    active: "border-emerald-400/30 bg-emerald-400/10",
    hover: "hover:border-emerald-400/30 hover:bg-emerald-400/10",
    labelHover: "group-hover:text-emerald-300",
  },
  blue: {
    bar: "from-blue-400 to-indigo-500",
    tile: "from-blue-400/20 to-indigo-500/10 text-blue-400 ring-blue-400/25",
    active: "border-blue-400/30 bg-blue-400/10",
    hover: "hover:border-blue-400/30 hover:bg-blue-400/10",
    labelHover: "group-hover:text-blue-300",
  },
  slate: {
    bar: "from-slate-400 to-slate-600",
    tile: "from-slate-400/20 to-slate-600/10 text-slate-400 ring-slate-400/25",
    active: "border-slate-400/30 bg-slate-400/10",
    hover: "hover:border-slate-400/30 hover:bg-slate-400/10",
    labelHover: "group-hover:text-slate-200",
  },
}

const menuItems = [
  { to: "/admin", label: "Beranda", subtitle: "Ringkasan statistik", icon: LayoutDashboard, accent: "cyan", end: true },
  { to: "/projects", label: "Karya", subtitle: "Manajemen karya", icon: FolderKanban, accent: "cyan" },
  { to: "/berita", label: "Berita", subtitle: "Kabar pengumuman", icon: Newspaper, accent: "cyan" },
  { to: "/kategori", label: "Kategori", subtitle: "Grup & label", icon: Tag, accent: "cyan" },
  { to: "/media", label: "Media", subtitle: "Galeri berkas", icon: Image, accent: "cyan" },
  { to: "/users", label: "Pengguna", subtitle: "Kelola akun", icon: Users, accent: "cyan" },
  { to: "/laporan", label: "Laporan", subtitle: "Statistik aktivitas", icon: BarChart3, accent: "cyan" },
  { to: "/pengaturan", label: "Pengaturan", subtitle: "Konfigurasi sistem", icon: Settings2, accent: "cyan" },
]

function SidebarAdmin({ collapsed, onToggle, mobileOpen, onMobileToggle }) {
  const asideWidth = collapsed
    ? "w-64 min-[700px]:w-20"
    : "w-64 min-[700px]:w-20 min-[1400px]:w-64"

  const itemRow = collapsed
    ? "justify-start gap-3.5 px-2.5 min-[700px]:justify-center min-[700px]:gap-0 min-[700px]:px-0"
    : "justify-start gap-3.5 px-2.5 min-[700px]:justify-center min-[700px]:gap-0 min-[700px]:px-0 min-[1400px]:justify-start min-[1400px]:gap-3.5 min-[1400px]:px-3"

  const labelClass = collapsed
    ? "block min-[700px]:hidden"
    : "block min-[700px]:hidden min-[1400px]:block"

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm min-[700px]:hidden"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-14 min-[360px]:top-16 5xl:top-20 6xl:top-24 z-40 flex h-auto max-h-[calc(100dvh-3.5rem)] min-[360px]:max-h-[calc(100dvh-4rem)] overflow-hidden min-[700px]:max-h-none min-[700px]:h-[calc(100vh-3.5rem)] min-[360px]:min-[700px]:h-[calc(100vh-4rem)] 5xl:h-[calc(100vh-5rem)] 6xl:h-[calc(100vh-6rem)] flex-col rounded-none border border-white/15 bg-brand-dark/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 ${asideWidth} ${
          mobileOpen ? "translate-y-0" : "-translate-y-[calc(100%+3.5rem)] min-[360px]:-translate-y-[calc(100%+4rem)]"
        } min-[700px]:translate-y-0`}
      >
      {/* AMBIENT GLOW */}
      <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-3xl" />

      {/* SUBTLE GRADIENT */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/30" />

      {/* MENU */}
      <nav className="relative flex flex-1 flex-col gap-2 overflow-y-auto p-2.5 5xl:p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* ruang untuk tombol menu mobile */}
        <div className="h-[3.75rem] min-[360px]:h-16 shrink-0 min-[700px]:hidden" />

        {menuItems.map((item) => {
          const Icon = item.icon
          const accent = ACCENTS[item.accent] || ACCENTS.cyan
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              onClick={mobileOpen ? onMobileToggle : undefined}
              className="group block"
            >
                  {({ isActive }) => (
                      <span
                        className={`sidebar-menu-item relative flex min-h-[56px] w-full cursor-pointer items-center rounded-2xl border transition-all duration-150 active:scale-[0.98] active:duration-100 ${itemRow} ${
                          isActive
                            ? "sidebar-menu-active"
                            : `border-transparent bg-white/[0.03] ${accent.hover}`
                        }`}
                      >
                    <span
                      className={`pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      } ${accent.bar}`}
                    />

                    <span className="relative z-10 flex min-w-0 items-center gap-3">
                      <span className={`sidebar-menu-tile flex h-10 w-10 5xl:h-11 6xl:h-12 5xl:w-11 6xl:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset transition-transform duration-300 group-hover:scale-[1.05] ${accent.tile}`}>
                        <Icon
                          size={18}
                          strokeWidth={2}
                        />
                      </span>
                      <span className={`min-w-0 flex-1 text-left ${labelClass}`}>
                        <span className="sidebar-menu-item-label block truncate text-sm 5xl:text-base 6xl:text-lg font-medium leading-tight">
                          {item.label}
                        </span>
                        {item.subtitle && (
                          <span className="sidebar-menu-subtitle mt-0.5 block truncate text-[11px] 5xl:text-xs 6xl:text-sm">
                            {item.subtitle}
                          </span>
                        )}
                      </span>
                    </span>
                  </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* BOTTOM - TOGGLE (Hanya di >= 1400px) */}
      <div className="relative z-10 hidden min-[1400px]:block shrink-0 border-t border-white/10 p-2 5xl:p-3">
        <button
          onClick={onToggle}
          className={`sidebar-collapse-btn group cursor-pointer items-center justify-center transition-all duration-150 active:scale-[0.98] active:duration-100 flex ${
            collapsed
              ? "sidebar-collapsed mx-auto h-10 w-10 rounded-xl"
              : "min-h-[46px] w-full gap-2.5 rounded-2xl border border-transparent bg-white/[0.03] px-3 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
          }`}
          aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={16} strokeWidth={2} />
          ) : (
            <>
              <span className="sidebar-collapse-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-cyan-400 ring-1 ring-inset ring-cyan-400/25 transition-transform duration-300 group-hover:scale-[1.05]">
                <ChevronLeft size={16} strokeWidth={2} />
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.6px]">Ciutkan</span>
            </>
          )}
        </button>
      </div>
      </aside>
    </>
  )
}

export default SidebarAdmin