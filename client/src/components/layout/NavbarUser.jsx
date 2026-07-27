import { useState, useRef, useEffect } from "react"
import { User, LogOut, UploadCloud, Bell, ChevronDown, Bookmark } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import logo from "../../assets/icons/logo.png"
import { useAuth } from "../../context/AuthContext"
import useNotifications from "../../hooks/useNotifications"
import NotificationBell from "./NotificationBell"
import NotificationPanel from "./NotificationPanel"
import MobileMenu from "./MobileMenu"

function NavbarUser() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const name = user?.name || "Pengguna"
  const role = user?.role || "user"
  const tipe = user?.tipe || "umum"

  const menuItems = [
    { to: "/user", label: "BERANDA" },
    { to: "/user/karya", label: "KARYA" },
    ...(tipe !== "umum"
      ? [{ to: "/user/upload", label: "UPLOAD PROJECT" }]
      : []),
    { to: "/user/about", label: "TENTANG" },
    { to: "/user/berita", label: "BERITA" },
  ]

  const profileMenuItems = [
    { to: "/user/profile", icon: User, label: "Profil Saya" },
    { to: "/user/karya-tersimpan", icon: Bookmark, label: "Karya Tersimpan" },
    ...(tipe !== "umum"
      ? [{ to: "/user/my-project", icon: UploadCloud, label: "Project Saya" }]
      : []),
  ]

  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navRef = useRef(null)
  const headerRef = useRef(null)
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const mobileNotifRef = useRef(null)

  const {
    notifications,
    unreadCount,
    isOpen: isNotifOpen,
    hasMore,
    isLoadingMore,
    togglePanel: toggleNotif,
    closePanel: closeNotif,
    loadMore,
    handleMarkAsRead: readNotif,
    handleMarkAllAsRead: readAllNotif,
  } = useNotifications()

  const roleLabel =
    role === "admin"
      ? "Admin"
      : tipe === "dosen"
        ? "Dosen"
        : tipe === "mahasiswa"
          ? "Mahasiswa"
          : "Umum"

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const roleBadgeClass =
    tipe === "dosen"
      ? "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20"
      : tipe === "mahasiswa"
        ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
        : "bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/20"

  const navLinkClass = ({ isActive }) =>
    `relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]"
        : "text-slate-300 hover:bg-white/5 hover:text-cyan-300 hover:-translate-y-0.5"
    }`

  const closeMenu = () => setIsOpen(false)

  const handleNotifToggle = () => {
    setIsOpen(false)
    toggleNotif()
  }

  const handleMenuToggle = () => {
    closeNotif()
    setIsOpen((prev) => !prev)
  }

  const handleNotifClick = (notif) => {
    readNotif(notif.id)
    closeNotif()
    if (notif.reference_type === "project" && notif.reference_id) {
      navigate("/user/karya")
    } else if (notif.reference_type === "news" && notif.reference_id) {
      navigate("/user/berita")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        mobileNotifRef.current &&
        !mobileNotifRef.current.contains(event.target)
      ) {
        closeNotif()
      }
    }

    if (isOpen || isProfileOpen || isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, isProfileOpen, isNotifOpen, closeNotif])

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const setVar = () =>
      document.documentElement.style.setProperty(
        "--navbar-h",
        `${el.offsetHeight}px`
      )
    setVar()
    const observer = new ResizeObserver(setVar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const notifProps = {
    unreadCount,
    notifications,
    hasMore,
    isLoadingMore,
    onMarkAllRead: readAllNotif,
    onLoadMore: loadMore,
    onClickNotif: handleNotifClick,
  }

  return (
    <header
      ref={(node) => {
        navRef.current = node
        headerRef.current = node
      }}
      className="fixed left-0 top-0 z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    >
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2.5 backdrop-blur-xl min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
        {/* LOGO */}
        <NavLink
          to="/user"
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
        <nav className="hidden flex-1 items-center justify-center font-medium lg:flex lg:gap-12 xl:gap-14 2xl:gap-16">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/user"}
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
          <div className="hidden items-center lg:flex">
            <div className="mr-3 h-8 w-px bg-white/10" />

            <div
              ref={profileRef}
              className="relative flex items-center gap-2.5"
            >
              <div className="select-none text-right">
                <p className="text-[13px] font-medium leading-tight text-white">
                  {name}
                </p>
                <span
                  className={`mt-0.5 inline-block rounded-full px-2 py-px text-[10px] font-medium ${roleBadgeClass}`}
                >
                  {roleLabel}
                </span>
              </div>

              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-semibold text-white transition-all duration-300 ring-2 ring-white/10 hover:ring-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,.15)]"
                aria-label="Menu akun"
              >
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-[1.5px] border-brand-dark bg-emerald-400" />
              </button>

              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />

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
                  const ItemIcon = item.icon
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
                  )
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
          </div>

          {/* Bell - Mobile */}
          <button
            ref={mobileNotifRef}
            onClick={handleNotifToggle}
            className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300 min-[350px]:h-9 min-[350px]:w-9 lg:hidden"
            aria-label="Notifikasi"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-lg shadow-red-500/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={handleMenuToggle}
            className="group relative flex h-7 w-7 cursor-pointer items-center justify-center min-[350px]:h-9 min-[350px]:w-9 lg:hidden"
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
        initials={initials}
        name={name}
        roleLabel={roleLabel}
        roleBadgeClass={roleBadgeClass}
        menuItems={menuItems}
        profileMenuItems={profileMenuItems}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      <NotificationPanel
        isOpen={isNotifOpen}
        {...notifProps}
        onClickNotif={(notif) => {
          handleNotifClick(notif)
          closeNotif()
        }}
      />
    </header>
  )
}

export default NavbarUser
