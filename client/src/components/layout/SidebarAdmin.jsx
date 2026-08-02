import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
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

const activeSpring = { type: "spring", stiffness: 480, damping: 36, mass: 0.9 }

const menuGroups = [
  {
    label: "",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "",
    items: [
      { to: "/projects", label: "Project", icon: FolderKanban },
      { to: "/berita", label: "Berita", icon: Newspaper },
      { to: "/kategori", label: "Kategori", icon: Tag },
      { to: "/media", label: "Media", icon: Image },
    ],
  },
  {
    label: "",
    items: [
      { to: "/users", label: "Pengguna", icon: Users },
      { to: "/laporan", label: "Laporan", icon: BarChart3 },
    ],
  },
  {
    label: "",
    items: [
      { to: "/pengaturan", label: "Pengaturan", icon: Settings2 },
    ],
  },
]

function SidebarAdmin({ collapsed, onToggle, mobileOpen, onMobileToggle }) {
  const asideWidth = collapsed
    ? "w-64 min-[700px]:w-20"
    : "w-64 min-[700px]:w-20 min-[1400px]:w-64"

  const itemAlign = collapsed
    ? "justify-start gap-3 min-[700px]:justify-center min-[700px]:gap-0"
    : "justify-start gap-3 min-[700px]:justify-center min-[700px]:gap-0 min-[1400px]:justify-start min-[1400px]:gap-3"

  const itemPad = collapsed
    ? "pl-5 pr-5 min-[700px]:pl-0 min-[700px]:pr-0"
    : "pl-5 pr-5 min-[700px]:pl-0 min-[700px]:pr-0 min-[1400px]:pl-5 min-[1400px]:pr-5"

  const labelClass = collapsed
    ? "inline min-[700px]:hidden"
    : "inline min-[700px]:hidden min-[1400px]:inline"

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm min-[700px]:hidden"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={`fixed left-0 top-14 min-[360px]:top-16 5xl:top-20 6xl:top-24 z-40 flex h-auto max-h-[calc(100dvh-3.5rem)] min-[360px]:max-h-[calc(100dvh-4rem)] overflow-hidden min-[700px]:max-h-none min-[700px]:h-[calc(100vh-3.5rem)] min-[360px]:min-[700px]:h-[calc(100vh-4rem)] 5xl:h-[calc(100vh-5rem)] 6xl:h-[calc(100vh-6rem)] flex-col bg-brand-dark border-r border-b border-l border-white/15 rounded-b-2xl min-[700px]:rounded-none min-[700px]:border-b-0 min-[700px]:border-l-0 shadow-2xl shadow-black/40 transition-all duration-300 ${asideWidth} ${
          mobileOpen ? "translate-y-0" : "-translate-y-[calc(100%+3.5rem)] min-[360px]:-translate-y-[calc(100%+4rem)]"
        } min-[700px]:translate-y-0`}
      >
      {/* AMBIENT GLOW */}
      <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-3xl" />

      {/* SUBTLE GRADIENT */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/30" />

      {/* MENU */}
      <nav className="relative flex flex-1 flex-col gap-2.5 overflow-y-auto p-2 5xl:p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="h-[3.75rem] shrink-0 min-[700px]:hidden" />
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={`flex flex-col gap-2.5 ${groupIndex === 0 ? "pt-2" : ""}`}>
            {group.label && (
              <p className="hidden px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 first:pt-3 min-[1400px]:block">
                {group.label}
              </p>
            )}

            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  onClick={mobileOpen ? onMobileToggle : undefined}
                  className="group"
                >
                  {({ isActive }) => (
                    <span
                      className={`relative flex min-h-[44px] w-full items-center text-[clamp(11px,1.8vw,13px)] font-semibold uppercase tracking-[0.8px] cursor-pointer transition-all duration-300 ease-out active:scale-[0.98] active:duration-100 ${itemAlign} ${itemPad} ${
                        isActive
                          ? "text-white"
                          : "text-slate-300 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 rounded-xl bg-white/[0.05]"
                          transition={activeSpring}
                        >
                          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-cyan-400" />
                        </motion.span>
                      )}

                      <span className="relative z-10 flex min-w-0 items-center gap-3">
                        <Icon
                          size={20}
                          strokeWidth={2}
                          className={`shrink-0 transition-all duration-300 ease-out group-hover:scale-[1.05] ${
                            isActive
                              ? "text-cyan-300"
                              : "text-slate-400 group-hover:text-cyan-300"
                          }`}
                        />
                        <span className={`truncate ${labelClass}`}>{item.label}</span>
                      </span>
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* BOTTOM - TOGGLE (Hanya di >= 1400px) */}
      <div className="relative z-10 hidden min-[1400px]:block shrink-0 border-t border-white/10 p-2 5xl:p-3">
        <button
          onClick={onToggle}
          className="group flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl px-2 text-slate-300 transition-all duration-300 ease-out hover:bg-white/[0.04] hover:text-white active:scale-[0.98] active:duration-100"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={18} className={`shrink-0 text-slate-400 transition-colors duration-300 group-hover:text-cyan-300 ${collapsed ? "hidden" : ""}`} />
          <ChevronRight size={18} className={`shrink-0 text-slate-400 transition-colors duration-300 group-hover:text-cyan-300 ${collapsed ? "" : "hidden"}`} />
          {!collapsed && <span className="text-[13px] font-semibold uppercase tracking-[0.8px]">Ciutkan</span>}
        </button>
      </div>
      </aside>
    </>
  )
}

export default SidebarAdmin
