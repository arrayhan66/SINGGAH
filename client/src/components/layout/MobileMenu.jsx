import { NavLink } from "react-router-dom";
import { ArrowUpRight, LogOut } from "lucide-react";
import UserAvatar from "../ui/UserAvatar";
import { itemSubtitle, itemAccent, itemActive, itemHover } from "./menuConstants";

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
  onPrefetch,
}) {
  const renderItem = ({ item, accentKey }) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === "/"}
      onClick={onClose}
      onMouseEnter={() => onPrefetch && onPrefetch(item.to)}
      className={
        (nav) =>
          "mobile-menu-item group relative flex cursor-pointer items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-[background-color,border-color,color] duration-150 " +
          (nav.isActive
            ? itemActive[accentKey] || itemActive.Beranda
            : "border-transparent bg-white/[0.03] hover:bg-white/[0.06] " +
              (itemHover[accentKey] || "hover:text-cyan-300"))
      }
    >
      <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ${
          itemAccent[accentKey] || itemAccent.Karya
        }`}
      >
        <item.icon size={18} strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`mobile-menu-item-label block text-[15px] font-medium leading-tight text-slate-200 transition-colors ${
            itemHover[accentKey] || "hover:text-cyan-300"
          }`}
        >
          {item.label}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-500">
          {itemSubtitle[item.label] || ""}
        </span>
      </span>

      <ArrowUpRight
        size={17}
        className="shrink-0 text-slate-500 opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300 group-hover:opacity-100"
      />
    </NavLink>
  );

  return (
    <div
      className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 min-[1100px]:hidden max-h-[calc(100dvh-var(--navbar-h)-1.25rem)] overflow-y-auto overscroll-contain transition-all duration-200 ${
        isOpen
          ? "mt-2 opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2 pointer-events-none"
      }`}
    >
      <div
        className={`mobile-menu-shell relative mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-[0_32px_80px_-24px_rgba(1,8,20,0.9)] backdrop-blur-2xl transition-transform duration-200 ease-out ${
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

        <div className="mobile-menu-profile mobile-menu-card relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 mx-3 mt-3">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
          />

          <div className="relative flex items-center gap-3.5">
            <div className="relative shrink-0 rounded-[22px] bg-gradient-to-br from-cyan-400/30 to-blue-500/10 p-[2px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#0b2a50] p-1 sm:h-14 sm:w-14">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                  <UserAvatar
                    name={user?.name}
                    avatar={user?.avatar}
                    className="h-full w-full"
                    imgSizeClass="h-full w-full"
                    fallbackSizeClass="h-full w-full"
                    textClass="text-lg font-bold"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b2a50] bg-emerald-400" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[15px] font-semibold text-white">
                  {name}
                </p>
                <span
                  aria-hidden="true"
                  className="inline-flex h-1 w-1 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                />
              </div>
              <span
                className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${roleBadgeClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        <nav className="relative flex flex-col gap-2 p-3">
          {menuItems.map((item) =>
            renderItem({ item, accentKey: item.label }),
          )}

          <div
            className="menu-section-label flex items-center gap-3 px-2 pt-1 pb-1.5"
            aria-hidden="true"
          >
            <span className="menu-divider-line menu-divider-line-start h-px flex-1" />
            <span className="menu-section-label-text">Akun Saya</span>
            <span className="menu-divider-line menu-divider-line-end h-px flex-1" />
          </div>

          {profileMenuItems.map((item) =>
            renderItem({ item, accentKey: item.label }),
          )}

          <button
            onClick={onLogout}
            className={`mobile-menu-item group relative flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-transparent bg-white/[0.03] px-3.5 py-3 text-left transition-[background-color,border-color,color] duration-150 hover:border-red-400/20 hover:bg-red-400/10`}
          >
            <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-red-500 to-rose-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset from-red-500/20 to-rose-500/10 text-red-400 ring-red-400/30">
              <LogOut size={18} strokeWidth={2} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium leading-tight text-slate-200 transition-colors group-hover:text-red-400">
                Keluar
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                Akhiri sesi
              </span>
            </span>

            <ArrowUpRight
              size={17}
              className="shrink-0 -rotate-45 text-slate-500 opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-400 group-hover:opacity-100"
            />
          </button>
        </nav>
      </div>
    </div>
  );
}
