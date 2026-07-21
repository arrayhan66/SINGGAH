import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  Newspaper,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import logo from "../../assets/icons/logo.png"

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Kelola Project", icon: FolderKanban },
  { to: "/admin/berita", label: "Kelola Berita", icon: Newspaper },
  { to: "/admin/users", label: "Kelola User", icon: Users },
]

function SidebarAdmin({ collapsed, onToggle }) {
  const navigate = useNavigate()

  function handleLogout() {
    // TODO: sambungkan ke logic auth beneran (clear token, dsb)
    navigate("/login")
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-brand-dark transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO + TOGGLE */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={logo}
            alt="SINGGAH Logo"
            className="h-9 w-9 shrink-0 object-contain"
          />
          {!collapsed && (
            <span className="truncate text-base font-bold text-white">
              SINGGAH
            </span>
          )}
        </div>
      </div>

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
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]"
                    : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                } ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* TOGGLE COLLAPSE */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 border-t border-white/10 px-3.5 py-3.5 text-slate-400 transition-colors hover:text-cyan-300"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span className="text-xs">Ciutkan</span>}
      </button>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 border-t border-white/10 px-3.5 py-4 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400 ${
          collapsed ? "justify-center" : ""
        }`}
        title={collapsed ? "Keluar" : undefined}
      >
        <LogOut size={19} className="shrink-0" />
        {!collapsed && "Keluar"}
      </button>
    </aside>
  )
}

export default SidebarAdmin
