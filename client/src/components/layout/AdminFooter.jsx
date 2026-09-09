import { NavLink } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import SmartImage from "../ui/SmartImage"
import logo from "../../assets/icons/logo.webp"

const menuItems = [
  { to: "/admin", label: "Beranda", end: true },
  { to: "/projects", label: "Karya" },
  { to: "/berita", label: "Berita" },
  { to: "/kategori", label: "Kategori" },
  { to: "/media", label: "Media" },
  { to: "/users", label: "Pengguna" },
  { to: "/laporan", label: "Laporan" },
  { to: "/pengaturan", label: "Pengaturan" },
]

function AdminFooter() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <footer className={`admin-footer mt-auto border-t ${isDark ? "border-white/10 bg-night-deep" : "border-[#e5e9ef] bg-white"}`}>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 md:py-8">
        {/* LOGO + MENU */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <NavLink to="/admin" className="flex shrink-0 items-center gap-2">
            <div className={`h-9 w-9 overflow-hidden rounded-lg ${isDark ? "" : "bg-white ring-1 ring-[#d7e2f2]"}`}>
              <SmartImage src={logo} alt="SINGGAH Logo" eager className="h-full w-full object-contain" />
            </div>
            <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#1b2a4a]"}`}>SINGGAH</span>
          </NavLink>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-xs transition-colors ${
                    isActive
                      ? `font-bold ${isDark ? "text-cyan-300" : "text-blue-600"}`
                      : isDark
                        ? "font-normal text-slate-300 hover:text-white"
                        : "font-normal text-[#64748b] hover:text-blue-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* COPYRIGHT */}
        <div className={`mt-5 border-t pt-4 text-center text-xs ${isDark ? "border-white/10 text-slate-500" : "border-[#d6e4fb] text-[#64748b]"}`}>
          Copyright © 2026 SINGGAH — Dibuat ElektroPoliban
        </div>
      </div>
    </footer>
  )
}

export default AdminFooter