import { useState, useRef, useEffect } from "react";
import {
  User,
  LogOut,
  UploadCloud,
  ChevronDown,
  Bookmark,
  Home,
  LayoutGrid,
  Info,
  Newspaper,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.webp";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import MobileMenu from "./MobileMenu";
import LogoutConfirmModal from "../ui/LogoutConfirmModal";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";
import NotificationDetailModal from "../ui/NotificationDetailModal";
import ThemeToggle from "../ui/ThemeToggle";
import UserAvatar from "../ui/UserAvatar";
import { itemBar, itemSubtitle, itemAccent, itemActive, itemHover, itemHoverBox } from "./menuConstants";
import { prefetchRouteFromLink } from "../../utils/routePrefetch";

function NavbarUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name || "Pengguna";
  const role = user?.role || "user";
  const tipe = user?.tipe || "umum";

  const menuItems = [
    { to: "/", label: "Beranda", icon: Home },
    { to: "/karya", label: "Karya", icon: LayoutGrid },
    ...(tipe !== "umum"
      ? [{ to: "/upload", label: "Upload Karya", icon: UploadCloud }]
      : []),
    { to: "/about", label: "Tentang", icon: Info },
    { to: "/berita", label: "Berita", icon: Newspaper },
  ];

  const profileMenuItems = [
    { to: "/profile", icon: User, label: "Profil Saya" },
    { to: "/karya-tersimpan", icon: Bookmark, label: "Karya Tersimpan" },
    ...(tipe !== "umum"
      ? [{ to: "/my-karya", icon: UploadCloud, label: "Karya Saya" }]
      : []),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [detailNotif, setDetailNotif] = useState(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const notifPanelRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isOpen: isNotifOpen,
    hasMore,
    isLoadingMore,
    isSelectionMode,
    selectedIds,
    isBulkLoading,
    confirmDeleteAll,
    setConfirmDeleteAll,
    togglePanel: toggleNotif,
    closePanel: closeNotif,
    loadMore,
    handleMarkAsRead: readNotif,
    handleMarkAsUnread: unreadNotif,
    handleMarkAllAsRead: readAllNotif,
    handleDeleteNotification: deleteNotif,
    handleDeleteAll: deleteAllNotif,
    enterSelectionMode,
    exitSelectionMode,
    handleToggleSelect,
    handleSelectAll,
    handleBulkAction,
  } = useNotifications();

  const roleLabel =
    role === "admin"
      ? "Admin"
      : tipe === "dosen"
        ? "Dosen"
        : tipe === "mahasiswa"
          ? "Mahasiswa"
          : "Umum";

  const roleBadgeClass =
    tipe === "dosen"
      ? "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20"
      : tipe === "mahasiswa"
        ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
        : "bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/20";

  const navLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 xl:px-5 ${
      isActive
        ? "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]"
        : "text-slate-300 hover:bg-white/5 hover:text-cyan-300 hover:-translate-y-0.5"
    }`;

  const closeMenu = () => setIsOpen(false);

  const handleMenuToggle = () => {
    closeNotif();
    setIsOpen((prev) => !prev);
  };

  const handleNotifToggle = () => {
    setIsOpen(false);
    toggleNotif();
  };

  const handleNotifClick = (notif) => {
    readNotif(notif.id);
    setDetailNotif(notif);
  };

  const handleNotifNavigate = (path) => {
    setDetailNotif(null);
    closeNotif();
    if (path) navigate(path);
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notifPanelRef.current &&
        !notifPanelRef.current.contains(event.target)
      ) {
        closeNotif();
      }
    }

    if (isOpen || isProfileOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isProfileOpen, isNotifOpen, closeNotif]);

  useEffect(() => {
    if (!isNotifOpen) return;

    const doc = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = doc.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    doc.style.overflow = "hidden";
    body.style.overflow = "hidden";
    doc.classList.add("no-scroll");

    const blockScroll = (e) => {
      const target = e.target;
      const insidePanel =
        notifPanelRef.current?.contains(target) ||
        notifRef.current?.contains(target);
      if (insidePanel) return;
      e.preventDefault();
    };

    const blockKeyScroll = (e) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "PageUp" ||
        e.key === "PageDown" ||
        e.key === "Home" ||
        e.key === "End" ||
        e.key === " "
      ) {
        if (
          !notifPanelRef.current?.contains(e.target) &&
          !notifRef.current?.contains(e.target)
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });
    document.addEventListener("keydown", blockKeyScroll);

    return () => {
      doc.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      doc.classList.remove("no-scroll");
      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
      document.removeEventListener("keydown", blockKeyScroll);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () =>
      document.documentElement.style.setProperty(
        "--navbar-h",
        `${el.offsetHeight}px`,
      );
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const notifProps = {
    unreadCount,
    notifications,
    hasMore,
    isLoadingMore,
    isSelectionMode,
    selectedIds,
    isBulkLoading,
    onMarkAllRead: readAllNotif,
    onLoadMore: loadMore,
    onClickNotif: handleNotifClick,
    onDeleteNotif: deleteNotif,
    onMarkUnread: unreadNotif,
    onEnterSelection: enterSelectionMode,
    onExitSelection: exitSelectionMode,
    onToggleSelect: handleToggleSelect,
    onSelectAll: handleSelectAll,
    onBulkAction: handleBulkAction,
    onRequestDeleteAll: () => setConfirmDeleteAll(true),
  };

  return (
    <header
      ref={(node) => {
        navRef.current = node;
        headerRef.current = node;
      }}
      className="fixed left-0 top-0 z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    >
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border border-white/10 bg-[#132d4d] px-2.5 py-2.5 backdrop-blur-xl min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
        {/* LOGO */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-3"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-xl min-[350px]:h-9 min-[350px]:w-9 sm:h-10 sm:w-10 md:h-11 md:w-11">
            <img
              src={logo}
              alt="SINGGAH Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-sm font-bold text-white min-[350px]:text-base sm:text-lg">
            SINGGAH
          </h1>
        </NavLink>

        {/* Menu - Desktop */}
        <nav className="hidden flex-1 items-center justify-center font-medium pl-4 min-[1100px]:flex min-[1100px]:pl-2 xl:pl-0 min-[1100px]:gap-3 xl:gap-8 2xl:gap-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onMouseEnter={() => prefetchRouteFromLink(item.to)}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-4">
          <ThemeToggle />

          <div className="ml-1 min-[350px]:ml-1.5 sm:ml-2">
            <NotificationBell
              ref={notifRef}
              isOpen={isNotifOpen}
              onToggle={handleNotifToggle}
              {...notifProps}
            />
          </div>

          {/* Profile - Desktop */}
          <div
            ref={profileRef}
            className="relative hidden items-center min-[1100px]:flex"
          >
            {/* Compact (lg only) - avatar only */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-semibold text-white transition-all duration-300 ring-2 ring-white/10 hover:ring-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,.15)] xl:hidden"
              aria-label="Menu akun"
            >
              <UserAvatar
                name={user?.name}
                avatar={user?.avatar}
                className="h-full w-full"
                imgSizeClass="h-full w-full"
                fallbackSizeClass="h-full w-full"
                textClass="text-xs font-semibold"
              />
              <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </button>

            {/* Full (xl+) - name + badge + avatar + chevron */}
            <div className="hidden items-center xl:flex">
              <div className="mr-3 h-8 w-px bg-white/10" />

              <div
                className="flex cursor-pointer items-center gap-2.5"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-semibold text-white transition-all duration-300 ring-2 ring-white/10 hover:ring-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,.15)]">
                  <UserAvatar
                    name={user?.name}
                    avatar={user?.avatar}
                    className="h-full w-full"
                    imgSizeClass="h-full w-full"
                    fallbackSizeClass="h-full w-full"
                    textClass="text-xs font-semibold"
                  />
                  <span className="absolute -bottom-0 -right-0 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>

                <div className="select-none text-left">
                  <p className="text-[13px] font-medium leading-tight text-white">
                    {name}
                  </p>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}
                  >
                    {roleLabel}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-slate-500 transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Dropdown */}
            <div
              className={`absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
                isProfileOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">{name}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}
                >
                  {roleLabel}
                </span>
              </div>

              <div className="p-1.5">
                {profileMenuItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsProfileOpen(false)}
                      className={({ isActive }) =>
                        "mobile-menu-item group relative flex items-center gap-3.5 rounded-2xl border px-3 py-2.5 transition-[background-color,border-color,color] duration-150 " +
                        (isActive
                          ? itemActive[item.label] || itemActive.Beranda
                          : "border-transparent " + (itemHoverBox[item.label] || itemHoverBox.Beranda))
                        }
                    >
                      <span
                        className={`pointer-events-none absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                          itemBar[item.label] || itemBar.Beranda
                        }`}
                      />
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ${
                          itemAccent[item.label] || "from-cyan-400/20 to-blue-500/10 text-cyan-400 ring-cyan-400/25"
                        }`}
                      >
                        <ItemIcon size={17} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium leading-tight text-slate-200 transition-colors ${itemHover[item.label] || "group-hover:text-cyan-300"}`}>
                          {item.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                          {itemSubtitle[item.label] || ""}
                        </span>
                      </span>
                    </NavLink>
                  );
                })}
                <div className="mx-2 my-1.5 h-px bg-white/10" />
                <button
                  onClick={handleLogout}
                  className="mobile-menu-item group relative flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border border-transparent px-3 py-2.5 text-left transition-[background-color,border-color,color] duration-150 hover:border-red-400/20 hover:bg-red-400/10"
                >
                  <span className="pointer-events-none absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-red-500 to-rose-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset from-red-500/20 to-rose-500/10 text-red-400 ring-red-400/30">
                    <LogOut size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-tight text-slate-200 transition-colors group-hover:text-red-400">
                      Keluar
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      Akhiri sesi
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Hamburger */}
          <button
            onClick={handleMenuToggle}
            className="group relative flex h-7 w-7 cursor-pointer items-center justify-center min-[350px]:h-9 min-[350px]:w-9 min-[1100px]:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 min-[350px]:w-6 ${
                isOpen
                  ? "rotate-45"
                  : "-translate-y-1.5 min-[350px]:-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-cyan-300 transition-all duration-300 min-[350px]:w-6 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 min-[350px]:w-6 ${
                isOpen
                  ? "-rotate-45"
                  : "translate-y-1.5 min-[350px]:translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={isOpen}
        user={user}
        name={name}
        roleLabel={roleLabel}
        roleBadgeClass={roleBadgeClass}
        menuItems={menuItems}
        profileMenuItems={profileMenuItems}
        onClose={closeMenu}
        onPrefetch={prefetchRouteFromLink}
        onLogout={() => { closeMenu(); setShowLogoutConfirm(true); }}
      />

      <NotificationPanel
        panelRef={notifPanelRef}
        isOpen={isNotifOpen}
        {...notifProps}
        onClickNotif={(notif) => {
          handleNotifClick(notif);
          closeNotif();
        }}
      />

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {confirmDeleteAll && (
        <DeleteConfirmModal
          title="Hapus semua notifikasi?"
          message="Semua notifikasi kamu akan dihapus permanen dan tidak bisa dikembalikan."
          confirmLabel="Ya, Hapus Semua"
          onConfirm={deleteAllNotif}
          onCancel={() => setConfirmDeleteAll(false)}
        />
      )}

      {detailNotif && (
        <NotificationDetailModal
          key={detailNotif.id}
          notif={detailNotif}
          onClose={() => setDetailNotif(null)}
          onNavigate={handleNotifNavigate}
        />
      )}
    </header>
  );
}

export default NavbarUser;
