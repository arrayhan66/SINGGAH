import { NavLink } from "react-router-dom"
import { LogOut } from "lucide-react"

export default function MobileMenu({
  isOpen,
  initials,
  name,
  roleLabel,
  roleBadgeClass,
  menuItems,
  profileMenuItems,
  onClose,
  onLogout,
}) {
  return (
    <div
      className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:hidden transition-all duration-300 ${
        isOpen
          ? "mt-2 opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
    >
      <div className="mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(73,126,174,.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(73,126,174,.3) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex items-center gap-3 border-b border-white/10 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <span className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <nav className="relative flex flex-col p-3">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/user"}
              onClick={onClose}
              style={{
                transitionDelay: isOpen ? `${index * 60}ms` : "0ms",
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base transition-all duration-300 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                } ${
                  isActive
                    ? "bg-cyan-400/10 text-cyan-300 font-semibold"
                    : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                }`
              }
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/40 transition-all duration-300 group-hover:w-4 group-hover:bg-cyan-400" />
              {item.label}
            </NavLink>
          ))}

          <div className="my-2 h-px bg-white/10" />

          {profileMenuItems.map((item, i) => {
            const ItemIcon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={{
                  transitionDelay: isOpen
                    ? `${(menuItems.length + i) * 60}ms`
                    : "0ms",
                }}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-cyan-300 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/40 transition-all duration-300 group-hover:w-4 group-hover:bg-cyan-400" />
                <ItemIcon size={18} />
                {item.label}
              </NavLink>
            )
          })}

          <button
            onClick={onLogout}
            style={{
              transitionDelay: isOpen
                ? `${(menuItems.length + profileMenuItems.length) * 60}ms`
                : "0ms",
            }}
            className={`group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-red-400 ${
              isOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-4 opacity-0"
            }`}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/40 transition-all duration-300 group-hover:w-4 group-hover:bg-red-400" />
            <LogOut size={18} />
            Keluar
          </button>
        </nav>
      </div>
    </div>
  )
}
