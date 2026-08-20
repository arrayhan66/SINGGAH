// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import { useState, useRef, useEffect } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/icons/logo.webp"
import { visitorMenu } from "../../constants/navigation"
import { Moon } from "lucide-react"

function LightModeNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)
  const headerRef = useRef(null)

  const navLinkClass = ({ isActive }) =>
    `relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-blue-600/10 text-blue-600 shadow-sm font-semibold"
        : "text-[#6B7280] hover:bg-slate-100 hover:text-blue-600"
    }`

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <header
      ref={(node) => {
        navRef.current = node
        headerRef.current = node
      }}
      className="fixed left-0 top-0 z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    >
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border-2 border-slate-300 bg-white px-3 py-3 shadow-xl shadow-slate-300/60 min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3.5 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
        <NavLink
          to="/light-mode"
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

          <div>
            <h1 className="text-sm font-bold text-[#1B2A4A] min-[350px]:text-base sm:text-lg">
              SINGGAH <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-1">Light Mode</span>
            </h1>
          </div>
        </NavLink>

        <nav className="hidden flex-1 items-center justify-center font-medium lg:flex lg:gap-12 xl:gap-14 2xl:gap-16">
          {visitorMenu.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-4">
          <NavLink
            to="/"
            title="Pindah ke Dark Mode (Original)"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Moon size={16} />
          </NavLink>

          <NavLink
            to="/login"
            onClick={closeMenu}
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-md shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95 sm:px-4 sm:py-2 sm:text-sm md:px-5 md:py-2.5 lg:px-6"
          >
            Login
          </NavLink>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="group relative flex h-7 w-7 cursor-pointer items-center justify-center min-[350px]:h-9 min-[350px]:w-9 lg:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-[#1B2A4A] transition-all duration-300 min-[350px]:w-6 ${
                isOpen
                  ? "rotate-45"
                  : "-translate-y-1.5 min-[350px]:-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-blue-600 transition-all duration-300 min-[350px]:w-6 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-[#1B2A4A] transition-all duration-300 min-[350px]:w-6 ${
                isOpen
                  ? "-rotate-45"
                  : "translate-y-1.5 min-[350px]:translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      <div
        className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:hidden transition-all duration-300 ${
          isOpen
            ? "mt-2 opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <div className="mx-auto max-w-[1700px] overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-xl">
          <nav className="relative flex flex-col p-3">
            {visitorMenu.map((item, index) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                style={{
                  transitionDelay: isOpen ? `${index * 60}ms` : "0ms",
                }}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base transition-all duration-300 ${
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  } ${
                    isActive
                      ? "bg-blue-600/10 text-blue-600 font-semibold"
                      : "text-[#6B7280] hover:bg-slate-100 hover:text-blue-600"
                  }`
                }
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600/40 transition-all duration-300 group-hover:w-4 group-hover:bg-blue-600" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default LightModeNavbar
