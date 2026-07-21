import { useState, useRef, useEffect } from "react"
import { User, LogOut, UploadCloud } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import logo from "../../assets/icons/logo.png"
import { useAuth } from "../../context/AuthContext"

function NavbarUser() {
  const { user, logout } = useAuth()

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

    ...(tipe !== "umum"
      ? [
          {
            to: "/user/my-project",
            icon: UploadCloud,
            label: "Project Saya",
          },
        ]
      : []),
  ]

  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navRef = useRef(null)
  const profileRef = useRef(null)

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
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const navLinkClass = ({ isActive }) =>
    `relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]"
        : "text-slate-300 hover:bg-white/5 hover:text-cyan-300 hover:-translate-y-0.5"
    }`

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 md:px-8"
    >
      <div className="mx-auto mt-3 sm:mt-4 md:mt-5 flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-6 sm:py-4 md:px-8 backdrop-blur-xl">
        {/* LOGO */}
        <NavLink
          to="/user"
          onClick={closeMenu}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center overflow-hidden rounded-xl shrink-0">
            <img
              src={logo}
              alt="SINGGAH Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain"
            />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white">SINGGAH</h1>
        </NavLink>

        {/* Menu - Desktop */}
        <nav className="hidden gap-6 font-medium lg:flex lg:gap-8">
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
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Nama + Avatar + Dropdown - Desktop */}
          <div
            ref={profileRef}
            className="relative hidden items-center gap-3 lg:flex"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>

            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white transition-all duration-300 hover:opacity-90"
              aria-label="Menu akun"
            >
              {initials}
            </button>

            <div
              className={`absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-xl backdrop-blur-xl transition-all duration-200 ${
                isProfileOpen
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
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

          {/* Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex h-9 w-9 cursor-pointer items-center justify-center lg:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${
                isOpen ? "rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-cyan-300 transition-all duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${
                isOpen ? "-rotate-45" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu - Mobile / Tablet */}
      <div
        className={`mx-auto max-w-7xl overflow-hidden transition-all duration-500 ease-in-out lg:hidden ${
          isOpen ? "mt-2 max-h-[600px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl">
          {/* Info user di mobile */}
          <div className="flex items-center gap-3 border-b border-white/10 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="text-xs text-slate-400">{roleLabel}</p>
            </div>
          </div>

          <nav className="relative flex flex-col p-3">
            {menuItems.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/user"}
                onClick={closeMenu}
                style={{ transitionDelay: isOpen ? `${index * 60}ms` : "0ms" }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base transition-all duration-300 ${
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
                  onClick={closeMenu}
                  style={{
                    transitionDelay: isOpen
                      ? `${(menuItems.length + i) * 60}ms`
                      : "0ms",
                  }}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-cyan-300 ${
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                >
                  <ItemIcon size={18} />
                  {item.label}
                </NavLink>
              )
            })}

            <button
              onClick={handleLogout}
              style={{
                transitionDelay: isOpen
                  ? `${(menuItems.length + profileMenuItems.length) * 60}ms`
                  : "0ms",
              }}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-base text-slate-300 transition-all duration-300 hover:bg-white/5 hover:text-red-400 ${
                isOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-4 opacity-0"
              }`}
            >
              <LogOut size={18} />
              Keluar
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default NavbarUser
