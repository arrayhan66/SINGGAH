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
const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Kelola Project", icon: FolderKanban },
  { to: "/admin/berita", label: "Kelola Berita", icon: Newspaper },
  { to: "/admin/kategori", label: "Kategori", icon: Tag },
  { to: "/admin/media", label: "Media", icon: Image },
  { to: "/admin/users", label: "Kelola User", icon: Users },
  { to: "/admin/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings2 },
]

function SidebarAdmin({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-16 5xl:top-20 6xl:top-24 z-40 flex h-[calc(100vh-4rem)] 5xl:h-[calc(100vh-5rem)] 6xl:h-[calc(100vh-6rem)] flex-col border-r border-white/10 bg-brand-dark transition-all duration-300 ${
        collapsed ? "w-16 sm:w-20 5xl:w-24" : "w-64 5xl:w-72 6xl:w-80"
      }`}
    >
      {/* MENU */}
      <nav className="flex flex-1 flex-col gap-0.5 5xl:gap-1 overflow-y-auto p-2 5xl:p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 5xl:gap-3 rounded-md px-2 py-2 5xl:py-2.5 text-xs 5xl:text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center 5xl:h-5 5xl:w-5 6xl:h-6 6xl:w-6">
                <Icon className="h-full w-full" />
              </div>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* BOTTOM - TOGGLE only */}
      <div className="border-t border-white/10 p-2 5xl:p-3">
        <button
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-center gap-2 5xl:gap-3 rounded-md px-2 py-2 5xl:py-2.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} className="5xl:size-5 6xl:size-6" /> : <ChevronLeft size={16} className="5xl:size-5 6xl:size-6" />}
          {!collapsed && <span className="text-xs 5xl:text-sm">Ciutkan</span>}
        </button>
      </div>
    </aside>
  )
}

export default SidebarAdmin
