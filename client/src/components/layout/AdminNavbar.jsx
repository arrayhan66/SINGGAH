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
        {/* NOTIFICATION BELL */}
        <div ref={notifRef} className="relative">
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
            className={`absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] min-[320px]:w-72 min-[480px]:w-80 sm:w-96 max-w-sm overflow-hidden rounded-lg min-[320px]:rounded-2xl border border-white/10 bg-brand-dark/95 shadow-2xl backdrop-blur-xl sm:w-96 5xl:w-[420px] 6xl:w-[480px] transition-all duration-200 ${
              isNotifOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2 min-[360px]:py-3 5xl:py-4">
              <h3 className="text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg font-semibold text-white">Notifikasi</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex cursor-pointer items-center gap-1 text-[10px] min-[360px]:text-xs 5xl:text-sm 6xl:text-base text-cyan-400 transition hover:text-cyan-300"
                >
                  <CheckCheck size={14} />
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-72 min-[360px]:max-h-80 5xl:max-h-96 6xl:max-h-[480px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 min-[360px]:py-8 5xl:py-10 text-slate-500">
                  <BellOff size={24} />
                  <p className="text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg">Belum ada notifikasi</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`flex w-full cursor-pointer gap-2 min-[360px]:gap-3 5xl:gap-4 border-b border-white/5 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2 min-[360px]:py-3 5xl:py-4 text-left transition hover:bg-white/5 ${
                      !notif.is_read ? "bg-cyan-400/5" : ""
                    }`}
                  >
                    <div
                      className={`flex h-7 min-[360px]:h-9 5xl:h-12 6xl:h-14 w-7 min-[360px]:w-9 5xl:w-12 6xl:w-14 shrink-0 items-center justify-center rounded-full text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg ${notifBg(notif.type)}`}
                    >
                      <span className={notifText(notif.type)}>
                        {notifIcon(notif.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[11px] min-[360px]:text-sm 5xl:text-base 6xl:text-lg leading-snug ${!notif.is_read ? "font-medium text-white" : "text-slate-300"}`}>
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-[10px] min-[360px]:text-xs 5xl:text-sm 6xl:text-base text-slate-500 line-clamp-1">{notif.message}</p>
                      <p className="mt-1 text-[9px] min-[360px]:text-[10px] 5xl:text-xs 6xl:text-sm text-slate-600">{formatRelativeTime(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && <span className="mt-1.5 h-1.5 min-[360px]:h-2 5xl:h-3 6xl:h-4 w-1.5 min-[360px]:w-2 5xl:w-3 6xl:w-4 shrink-0 rounded-full bg-cyan-400" />}
                  </button>
                ))
              )}
            </div>

            {hasMore && (
              <div className="border-t border-white/10 px-3 min-[360px]:px-4 5xl:px-5 6xl:px-6 py-2">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="w-full cursor-pointer text-center text-[10px] min-[360px]:text-xs 5xl:text-sm 6xl:text-base text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
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
            className="flex cursor-pointer items-center gap-1.5 min-[260px]:gap-1 5xl:gap-2.5 rounded-md min-[360px]:rounded-lg 5xl:rounded-xl px-1.5 min-[360px]:px-2 5xl:px-3 py-1 transition-colors hover:bg-white/5"
          >
            <div className="flex h-6 min-[320px]:h-7 min-[360px]:h-8 5xl:h-10 6xl:h-12 w-6 min-[320px]:w-7 min-[360px]:w-8 5xl:w-10 6xl:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[9px] min-[320px]:text-[10px] min-[360px]:text-[11px] 5xl:text-sm 6xl:text-base font-semibold text-white ring-2 ring-white/10">
              {user?.avatar ? (
                <img src={user.avatar} alt={name} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="hidden min-[360px]:block text-xs min-[360px]:text-sm 5xl:text-base 6xl:text-lg font-medium text-white">{name}</span>
            <ChevronDown size={14} className={`hidden min-[360px]:block text-slate-500 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
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
          onConfirm={() => { logout(); navigate("/login", { replace: true }); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  )
}

export default AdminNavbar
