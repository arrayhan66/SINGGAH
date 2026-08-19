import { useState, useRef, useEffect } from "react";
import { User, LogOut, UploadCloud, ChevronDown, Bookmark } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.webp";
import { useAuth } from "../../context/AuthContext";
import useNotifications from "../../hooks/useNotifications";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import MobileMenu from "./MobileMenu";
import LogoutConfirmModal from "../ui/LogoutConfirmModal";
import DeleteConfirmModal from "../ui/DeleteConfirmModal";
import NotificationDetailModal from "../ui/NotificationDetailModal";

function NavbarUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name = user?.name || "Pengguna";
  const role = user?.role || "user";
  const tipe = user?.tipe || "umum";

  const menuItems = [
    { to: "/", label: "Beranda" },
    { to: "/karya", label: "Karya" },
    ...(tipe !== "umum" ? [{ to: "/upload", label: "Upload Karya" }] : []),
    { to: "/about", label: "Tentang" },
    { to: "/berita", label: "Berita" },
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

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleBadgeClass =
    tipe === "dosen"
      ? "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20"
      : tipe === "mahasiswa"
        ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
        : "bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/20";

  const navLinkClass = ({ isActive }) =>
    `relative whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]"
        : "text-slate-300 hover:bg-white/5 hover:text-cyan-300 hover:-translate-y-0.5"
    }`;

  const closeMenu = () => setIsOpen(false);

  const handleMenuToggle = () => {
    closeNotif();
    setIsOpen((prev) => !prev);
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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        closeNotif();
      }
    }

    if (isOpen || isProfileOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isProfileOpen, isNotifOpen, closeNotif]);

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
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2.5 backdrop-blur-xl min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
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
        <nav className="hidden flex-1 items-center justify-center font-medium pl-4 min-[1100px]:flex min-[1100px]:pl-2 xl:pl-0 min-[1100px]:gap-4 xl:gap-12 2xl:gap-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-4">
          <NotificationBell
            ref={notifRef}
            isOpen={isNotifOpen}
            onToggle={toggleNotif}
            {...notifProps}
          />

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
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-brand-dark bg-emerald-400" />
            </button>

            {/* Full (xl+) - name + badge + avatar + chevron */}
            <div className="hidden items-center xl:flex">
              <div className="mr-3 h-8 w-px bg-white/10" />

              <div
                className="flex cursor-pointer items-center gap-2.5"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-semibold text-white transition-all duration-300 ring-2 ring-white/10 hover:ring-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,.15)]">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-brand-dark bg-emerald-400" />
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
              className={`absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
                isProfileOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-medium text-white">{name}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}
                >
                  {roleLabel}
                </span>
              </div>

              {profileMenuItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-cyan-300"
                  >
                    <ItemIcon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="h-px bg-white/10" />
              <button
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-red-400"
              >
                <LogOut size={16} />
                Keluar
              </button>
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
        initials={initials}
        name={name}
        roleLabel={roleLabel}
        roleBadgeClass={roleBadgeClass}
        menuItems={menuItems}
        profileMenuItems={profileMenuItems}
        onClose={closeMenu}
        onLogout={() => { closeMenu(); setShowLogoutConfirm(true); }}
      />

      <NotificationPanel
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
