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
import { useAuth } from "../../context/AuthContext"

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Kelola Project", icon: FolderKanban },
  { to: "/admin/berita", label: "Kelola Berita", icon: Newspaper },
  { to: "/admin/users", label: "Kelola User", icon: Users },
]

function SidebarAdmin({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-brand-dark transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* LOGO */}
      <div className={`flex items-center gap-2.5 border-b border-white/10 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          <img
            src={logo}
            alt="SINGGAH Logo"
            className="h-full w-full object-contain"
          />
        </div>
        {!collapsed && (
          <span className="truncate text-base font-bold text-white">
            SINGGAH
          </span>
        )}
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

      {/* BOTTOM */}
      <div className="border-t border-white/10 p-3">
        {/* TOGGLE - desktop only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Ciutkan</span>}
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Keluar" : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && "Keluar"}
        </button>
      </div>
    </aside>
  )
}

export default SidebarAdmin
