import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Bell, Megaphone, User, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/icons/logo.webp"
import useNotifications from "../../hooks/useNotifications"
import NotificationDropdown from "./NotificationDropdown"
import LogoutConfirmModal from "../ui/LogoutConfirmModal"
import DeleteConfirmModal from "../ui/DeleteConfirmModal"
import NotificationDetailModal from "../ui/NotificationDetailModal"
import AnnouncementModal from "../ui/AnnouncementModal"
import ThemeToggle from "../ui/ThemeToggle"
import UserAvatar from "../ui/UserAvatar"
import { sendAnnouncement } from "../../services/notificationService"

const roleLabels = {
  admin: { label: "Administrator", class: "bg-cyan-400/10 text-cyan-300" },
  user: { label: "Mahasiswa", class: "bg-emerald-400/10 text-emerald-300" },
}

function AdminNavbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [detailNotif, setDetailNotif] = useState(null)
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announceError, setAnnounceError] = useState("")
  const [announceSuccess, setAnnounceSuccess] = useState("")
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
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
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        closeNotif()
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isNotifOpen, closeNotif])

  const handleNotifClick = (notif) => {
    readNotif(notif.id)
    setDetailNotif(notif)
  }

  const handleNotifNavigate = (path) => {
    setDetailNotif(null);
    closeNotif();
    if (path) navigate(path);
  }

  const handleSendAnnouncement = async ({ title, message, audience }) => {
    setAnnounceError("")
    setAnnounceSuccess("")
    setIsSendingAnnouncement(true)
    try {
      const result = await sendAnnouncement({ title, message, audience })
      setAnnounceSuccess(
        `Pengumuman terkirim ke ${result?.affected ?? 0} pengguna`,
      )
    } catch (err) {
      setAnnounceError(err?.response?.data?.message || "Gagal mengirim pengumuman")
    } finally {
      setIsSendingAnnouncement(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 min-[360px]:h-16 5xl:h-20 6xl:h-24 items-center justify-between gap-2 min-[260px]:gap-1 border-b border-white/10 bg-brand-dark/90 px-2 min-[320px]:px-3 md:px-6 5xl:px-8 6xl:px-10 backdrop-blur-xl">
        {/* LOGO */}
        <NavLink to="/admin" className="flex items-center gap-1.5 min-[260px]:gap-1 shrink-0">
          <div className="flex h-6 min-[320px]:h-7 min-[360px]:h-8 5xl:h-10 6xl:h-12 w-6 min-[320px]:w-7 min-[360px]:w-8 5xl:w-10 6xl:w-12 items-center justify-center overflow-hidden rounded-md min-[320px]:rounded-lg">
            <img src={logo} alt="SINGGAH Logo" className="h-full w-full object-contain" />
          </div>
          <span className="hidden min-[320px]:block text-sm min-[360px]:text-base 5xl:text-xl 6xl:text-2xl font-bold text-white">SINGGAH</span>
        </NavLink>

        {/* RIGHT */}
        <div className="flex items-center gap-2 min-[260px]:gap-1.5 5xl:gap-4 6xl:gap-5">
        {/* THEME TOGGLE */}
        <ThemeToggle />

        {/* ANNOUNCEMENT BUTTON */}
        <button
          onClick={() => { setAnnounceError(""); setAnnounceSuccess(""); setShowAnnouncement(true); }}
          className="flex h-8 min-[360px]:h-9 5xl:h-11 6xl:h-12 cursor-pointer items-center gap-1 rounded-md min-[360px]:rounded-lg 5xl:rounded-xl bg-amber-400/10 px-2 min-[360px]:px-3 5xl:px-4 text-[10px] min-[360px]:text-xs 5xl:text-sm 6xl:text-base font-medium text-amber-300 transition-colors hover:bg-amber-400/20"
          title="Kirim pengumuman"
        >
          <Megaphone size={16} />
          <span className="hidden min-[500px]:inline">Pengumuman</span>
        </button>

        {/* NOTIFICATION BELL */}
        <div ref={notifRef} className="relative ml-2 min-[400px]:ml-0">
          <button
            onClick={toggleNotif}
            className="relative flex h-8 min-[360px]:h-9 5xl:h-11 6xl:h-12 w-8 min-[360px]:w-9 5xl:w-11 6xl:w-12 items-center justify-center rounded-md min-[360px]:rounded-lg 5xl:rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 cursor-pointer"
            title="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 min-[360px]:h-4 5xl:h-5 6xl:h-6 min-w-[12px] min-[360px]:min-w-4 5xl:min-w-5 items-center justify-center rounded-full bg-red-500 px-0.5 min-[360px]:px-1 5xl:px-1.5 text-[8px] min-[360px]:text-[10px] 5xl:text-xs 6xl:text-sm font-bold text-white shadow-lg shadow-red-500/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <div
            className={`fixed left-3 right-3 top-20 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl transition-all duration-200 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-none sm:overflow-hidden 5xl:w-[420px] 6xl:w-[480px] ${
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
            className="flex cursor-pointer items-center gap-1.5 min-[260px]:gap-1 5xl:gap-2.5 rounded-md min-[360px]:rounded-lg 5xl:rounded-xl px-1.5 min-[360px]:px-2 5xl:px-3 py-1 transition-colors hover:bg-white/5"
          >
            <div className="flex h-5 min-[320px]:h-6 min-[400px]:h-8 5xl:h-10 6xl:h-12 w-5 min-[320px]:w-6 min-[400px]:w-8 5xl:w-10 6xl:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[8px] min-[320px]:text-[9px] min-[400px]:text-[11px] 5xl:text-sm 6xl:text-base font-semibold text-white ring-2 ring-white/10">
              <UserAvatar
                name={name}
                avatar={user?.avatar}
                className="h-full w-full"
                imgSizeClass="h-full w-full"
                fallbackSizeClass="h-full w-full"
                textClass="text-[8px] min-[320px]:text-[9px] min-[400px]:text-[11px] 5xl:text-sm 6xl:text-base font-semibold"
              />
            </div>
            <span className="hidden min-[400px]:block text-xs min-[400px]:text-sm 5xl:text-base 6xl:text-lg font-medium text-white">{name}</span>
            <ChevronDown size={14} className={`hidden min-[400px]:block text-slate-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* PROFILE DROPDOWN */}
          <div
            className={`absolute right-0 top-full mt-2 w-44 min-[320px]:w-48 min-[360px]:w-52 5xl:w-60 6xl:w-72 overflow-hidden rounded-lg min-[320px]:rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
              isProfileOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="border-b border-white/10 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2 min-[360px]:py-3 5xl:py-4">
              <p className="text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg font-medium text-white">{name}</p>
              <span className={`mt-0.5 min-[360px]:mt-1 inline-block rounded-full px-1.5 min-[360px]:px-2 5xl:px-2.5 py-px text-[9px] min-[360px]:text-[10px] 5xl:text-xs 6xl:text-sm font-medium ${roleClass}`}>
                {roleLabel}
              </span>
            </div>

            <NavLink
              to="/profile"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-2 min-[360px]:gap-3 5xl:gap-4 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2 min-[360px]:py-3 5xl:py-4 text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg text-slate-300 transition hover:bg-white/5 hover:text-cyan-300"
            >
              <User size={16} />
              Profil Saya
            </NavLink>

            <div className="h-px bg-white/10" />

            <button
              onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }}
              className="flex w-full cursor-pointer items-center gap-2 min-[360px]:gap-3 5xl:gap-4 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2 min-[360px]:py-3 5xl:py-4 text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg text-slate-300 transition hover:bg-white/5 hover:text-red-400"
            >
              <LogOut size={16} />
              Keluar
            </button>
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

      {showAnnouncement && (
        <AnnouncementModal
          onSend={handleSendAnnouncement}
          onClose={() => setShowAnnouncement(false)}
          isSending={isSendingAnnouncement}
          error={announceError}
          success={announceSuccess}
        />
      )}
    </>
  )
}

export default AdminNavbar
