import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Bell, User, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/icons/logo.webp"
import { useNotifications } from "../../context/NotificationContext"
import NotificationDropdown from "./NotificationDropdown"
import LogoutConfirmModal from "../ui/LogoutConfirmModal"
import DeleteConfirmModal from "../ui/DeleteConfirmModal"
import NotificationDetailModal from "../ui/NotificationDetailModal"
import ThemeToggle from "../ui/ThemeToggle"
import UserAvatar from "../ui/UserAvatar"
import SmartImage from "../ui/SmartImage"
import { itemBar, itemSubtitle, itemAccent, itemActive, itemHover, itemHoverBox } from "./menuConstants"

const roleLabels = {
  admin: { label: "Administrator", class: "bg-cyan-400/10 text-cyan-300" },
  user: { label: "Mahasiswa", class: "bg-emerald-400/10 text-emerald-300" },
}

const profileMenuItems = [{ to: "/profile", icon: User, label: "Profil Saya" }]

function AdminNavbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [detailNotif, setDetailNotif] = useState(null)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

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
  } = useNotifications()

  const name = user?.name || "Admin"
  const role = user?.role || "admin"
  const { label: roleLabel, class: roleClass } = roleLabels[role] || roleLabels.admin

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isProfileOpen])

  useEffect(() => {
    function handleClickOutside(e) {
      if (detailNotif || showLogoutConfirm || confirmDeleteAll) return
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        closeNotif()
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isNotifOpen, closeNotif, detailNotif, showLogoutConfirm, confirmDeleteAll])

  const handleNotifClick = (notif) => {
    readNotif(notif.id)
    setDetailNotif(notif)
  }

  const handleNotifNavigate = (path) => {
    setDetailNotif(null);
    closeNotif();
    if (path) navigate(path);
  }

  return (
    <>
      <header className="admin-navbar fixed top-0 left-0 right-0 z-50 flex h-14 min-[360px]:h-16 5xl:h-20 6xl:h-24 items-center justify-between gap-2 min-[260px]:gap-1 border-b border-white/10 bg-brand-dark/90 px-2 min-[320px]:px-3 md:px-6 5xl:px-8 6xl:px-10 backdrop-blur-xl">
        {/* LOGO */}
        <NavLink to="/admin" className="flex items-center gap-1.5 min-[260px]:gap-1 shrink-0">
          <div className="flex h-6 min-[320px]:h-7 min-[360px]:h-8 5xl:h-10 6xl:h-12 w-6 min-[320px]:w-7 min-[360px]:w-8 5xl:w-10 6xl:w-12 items-center justify-center overflow-hidden rounded-md min-[320px]:rounded-lg">
            <SmartImage src={logo} alt="SINGGAH Logo" eager className="h-full w-full object-contain" />
          </div>
          <span className="text-sm min-[360px]:text-base 5xl:text-xl 6xl:text-2xl font-bold text-white">SINGGAH</span>
        </NavLink>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-2.5 min-[400px]:gap-3 sm:gap-3.5 md:gap-4 5xl:gap-5 6xl:gap-6">
        {/* THEME TOGGLE */}
        <div className="flex h-8 min-[360px]:h-9 5xl:h-11 6xl:h-12 shrink-0 items-center justify-center">
          <ThemeToggle />
        </div>

        {/* NOTIFICATION BELL */}
        <div ref={notifRef} className="relative">
          <button
            onClick={toggleNotif}
            className={`notification-bell h-8 min-[360px]:h-9 5xl:h-11 6xl:h-12 w-8 min-[360px]:w-9 5xl:w-11 6xl:w-12 ${
              unreadCount > 0 ? "has-unread" : ""
            }`}
            title="Notifikasi"
          >
            <Bell
              size={18}
              fill="currentColor"
              fillOpacity={0.12}
              className="notification-bell-icon"
            />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <div
            className={`fixed left-3 right-3 top-20 z-50 max-h-[75vh] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-200 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[70vh] 5xl:w-[420px] 6xl:w-[480px] ${
              isNotifOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              isBulkLoading={isBulkLoading}
              onMarkAllRead={readAllNotif}
              onLoadMore={loadMore}
              onClickNotif={handleNotifClick}
              onDeleteNotif={deleteNotif}
              onMarkUnread={unreadNotif}
              onEnterSelection={enterSelectionMode}
              onExitSelection={exitSelectionMode}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onBulkAction={handleBulkAction}
              onRequestDeleteAll={() => setConfirmDeleteAll(true)}
            />
          </div>
        </div>

        {/* PROFILE */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="profile-btn flex h-9 min-[360px]:h-10 5xl:h-12 6xl:h-14 w-9 min-[360px]:w-10 5xl:w-12 6xl:w-14 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95 active:duration-100 min-[700px]:w-auto min-[700px]:justify-start min-[700px]:gap-1.5 min-[700px]:px-1.5 5xl:gap-2.5 5xl:px-3"
          >
            <div className="flex h-8 min-[360px]:h-9 5xl:h-11 6xl:h-12 w-8 min-[360px]:w-9 5xl:w-11 6xl:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[9px] min-[360px]:text-[10px] 5xl:text-sm 6xl:text-base font-semibold text-white ring-2 ring-cyan-400/30 shadow-md shadow-cyan-500/30 min-[700px]:-ml-1.5">
              <UserAvatar
                name={name}
                avatar={user?.avatar}
                className="h-full w-full"
                imgSizeClass="h-full w-full"
                fallbackSizeClass="h-full w-full"
                textClass="text-[9px] min-[360px]:text-[10px] 5xl:text-sm 6xl:text-base font-semibold"
              />
            </div>
            <span className="profile-name hidden min-[700px]:block text-xs min-[400px]:text-sm 5xl:text-base 6xl:text-lg font-medium text-white">{name}</span>
            <ChevronDown size={14} className={`profile-chevron hidden min-[700px]:block text-slate-500 transition-all duration-200 ${isProfileOpen ? "rotate-180 text-cyan-300" : ""}`} />
          </button>

          {/* PROFILE DROPDOWN */}
          <div
            className={`absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
              isProfileOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">{name}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleClass}`}>
                {roleLabel}
              </span>
            </div>

            <div className="max-h-[min(calc(100dvh-6rem),26rem)] overflow-y-auto p-1.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15">
              {profileMenuItems.map((item) => {
                const ItemIcon = item.icon
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
                )
              })}
              <div className="mx-2 my-1.5 h-px bg-white/10" />
              <button
                onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }}
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
        </div>
      </header>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={() => { logout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {confirmDeleteAll && (
        <DeleteConfirmModal
          title="Hapus semua notifikasi?"
          message="Semua notifikasi akan dihapus permanen dan tidak bisa dikembalikan."
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
    </>
  )
}

export default AdminNavbar
