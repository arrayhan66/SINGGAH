import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Bell, CheckCheck, BellOff, User, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/icons/logo.png"
import useNotifications from "../../hooks/useNotifications"
import {
  formatRelativeTime,
  notifIcon,
  notifBg,
  notifText,
} from "../../utils/notificationHelpers"
import LogoutConfirmModal from "../ui/LogoutConfirmModal"

const roleLabels = {
  admin: { label: "Administrator", class: "bg-cyan-400/10 text-cyan-300" },
  user: { label: "Mahasiswa", class: "bg-emerald-400/10 text-emerald-300" },
}

function AdminNavbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  const {
    notifications,
    unreadCount,
    isOpen: isNotifOpen,
    hasMore,
    isLoadingMore,
    togglePanel: toggleNotif,
    closePanel: closeNotif,
    loadMore,
    handleMarkAsRead,
    handleMarkAllAsRead,
  } = useNotifications()

  const name = user?.name || "Admin"
  const role = user?.role || "admin"
  const { label: roleLabel, class: roleClass } = roleLabels[role] || roleLabels.admin

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

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

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) await handleMarkAsRead(notif.id)
    closeNotif()
    if (notif.reference_type === "project") navigate("/karya")
    else if (notif.reference_type === "news") navigate("/berita")
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-brand-dark/90 px-4 backdrop-blur-xl md:px-6">
        {/* LOGO */}
        <NavLink to="/admin" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
            <img src={logo} alt="SINGGAH Logo" className="h-full w-full object-contain" />
          </div>
          <span className="hidden sm:block text-base font-bold text-white">SINGGAH</span>
        </NavLink>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
        {/* NOTIFICATION BELL */}
        <div ref={notifRef} className="relative">
          <button
            onClick={toggleNotif}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200 cursor-pointer"
            title="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          <div
            className={`absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl sm:w-96 transition-all duration-200 ${
              isNotifOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex cursor-pointer items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
                >
                  <CheckCheck size={14} />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-slate-500">
                  <BellOff size={24} />
                  <p className="text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`flex w-full cursor-pointer gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 ${
                      !notif.is_read ? "bg-cyan-400/5" : ""
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${notifBg(notif.type)}`}
                    >
                      <span className={notifText(notif.type)}>
                        {notifIcon(notif.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${!notif.is_read ? "font-medium text-white" : "text-slate-300"}`}>
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{notif.message}</p>
                      <p className="mt-1 text-[10px] text-slate-600">{formatRelativeTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />}
                  </button>
                ))
              )}
            </div>

            {hasMore && (
              <div className="border-t border-white/10 px-4 py-2.5">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="w-full cursor-pointer text-center text-xs text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
                >
                  {isLoadingMore ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[11px] font-semibold text-white ring-2 ring-white/10">
              {user?.avatar ? (
                <img src={user.avatar} alt={name} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="hidden min-[500px]:block text-sm font-medium text-white">{name}</span>
            <ChevronDown size={14} className={`hidden min-[500px]:block text-slate-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* PROFILE DROPDOWN */}
          <div
            className={`absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
              isProfileOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="text-sm font-medium text-white">{name}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleClass}`}>
                {roleLabel}
              </span>
            </div>

            <NavLink
              to="/admin/profile"
              onClick={() => setIsProfileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-cyan-300"
            >
              <User size={16} />
              Profil Saya
            </NavLink>

            <div className="h-px bg-white/10" />

            <button
              onClick={() => { setIsProfileOpen(false); setShowLogoutConfirm(true); }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-red-400"
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
          onConfirm={() => { logout(); navigate("/login", { replace: true }); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}

export default AdminNavbar
