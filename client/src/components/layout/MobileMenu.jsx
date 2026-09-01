import { NavLink } from "react-router-dom";
import { ArrowUpRight, LogOut } from "lucide-react";
import UserAvatar from "../ui/UserAvatar";

export default function MobileMenu({
  isOpen,
  user,
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
      className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 min-[1100px]:hidden transition-all duration-300 ${
        isOpen
          ? "mt-2 opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
    >
      <div
        className={`relative mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-[0_32px_80px_-24px_rgba(1,8,20,0.9)] backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <span
          aria-hidden="true"
          className="menu-hairline pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
        />
        <span
          aria-hidden="true"
          className="menu-glow pointer-events-none absolute -top-24 -right-14 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl"
        />
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
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
            <UserAvatar
              name={user?.name}
              avatar={user?.avatar}
              className="h-full w-full"
              imgSizeClass="h-full w-full"
              fallbackSizeClass="h-full w-full"
              textClass="text-sm font-bold"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-brand-dark bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{name}</p>
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}
            >
              {roleLabel}
            </span>
          </div>
        </div>

        <nav className="relative flex flex-col gap-1 p-3">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              style={{
                transitionDelay: isOpen ? `${index * 70}ms` : "0ms",
              }}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-xl px-4 py-3.5 text-base transition-all duration-300 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                } ${
                  isActive
                    ? "bg-cyan-400/10 font-semibold text-cyan-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                }`
              }
            >
              <span className="flex w-6 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/40 transition-all duration-300 group-hover:w-4 group-hover:bg-cyan-400" />
              </span>
              <span className="flex-1">{item.label}</span>
              <ArrowUpRight
                size={18}
                className="shrink-0 opacity-30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </NavLink>
          ))}

          <div className="my-2 h-px bg-white/10" />

          {profileMenuItems.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={{
                  transitionDelay: isOpen
                    ? `${(menuItems.length + i) * 70}ms`
                    : "0ms",
                }}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-cyan-300 ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
              >
                <span className="flex w-6 shrink-0 justify-center">
                  <ItemIcon size={18} className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                </span>
                <span className="flex-1">{item.label}</span>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 opacity-30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </NavLink>
            );
          })}

          <button
            onClick={onLogout}
            style={{
              transitionDelay: isOpen
                ? `${(menuItems.length + profileMenuItems.length) * 70}ms`
                : "0ms",
            }}
            className={`group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-red-400 ${
              isOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
            }`}
          >
            <span className="flex w-6 shrink-0 justify-center">
              <LogOut size={18} className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
            <span className="flex-1">Keluar</span>
            <ArrowUpRight
              size={18}
              className="shrink-0 -rotate-45 opacity-30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
            />
          </button>
        </nav>
      </div>
    </div>
  );
}
