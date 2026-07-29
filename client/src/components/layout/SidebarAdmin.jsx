import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Kelola Project", icon: FolderKanban },
  { to: "/admin/berita", label: "Kelola Berita", icon: Newspaper },
  { to: "/admin/users", label: "Kelola User", icon: Users },
]

function SidebarAdmin({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-white/10 bg-brand-dark transition-all duration-300 ${
        collapsed ? "w-16 sm:w-20" : "w-64"
      }`}
    >
      {/* MENU */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* BOTTOM - TOGGLE only */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={onToggle}
          className="hidden lg:flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Ciutkan</span>}
        </button>
      </div>
    </aside>
  )
}

export default SidebarAdmin
