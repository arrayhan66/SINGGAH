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
            <h1 className="text-sm font-bold text-neutral-900 min-[350px]:text-base sm:text-lg">
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
            className="flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all min-[350px]:h-[26px] min-[350px]:w-[26px] sm:h-[28px] sm:w-[28px] md:h-[32px] md:w-[32px] lg:h-[34px] lg:w-[34px] 2xl:h-[38px] 2xl:w-[38px] min-[2000px]:h-[42px] min-[2000px]:w-[42px]"
          >
            <Moon size={16} className="h-2.5 w-2.5 min-[350px]:h-3 min-[350px]:w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-[18px] lg:w-[18px] 2xl:h-5 2xl:w-5 min-[2000px]:h-[22px] min-[2000px]:w-[22px]" />
          </NavLink>

          <NavLink
            to="/login"
            onClick={closeMenu}
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold tracking-wide text-white shadow-md shadow-blue-500/30 transition-all hover:bg-blue-700 active:scale-95 min-[350px]:px-3 min-[350px]:py-1.5 min-[350px]:text-[11px] sm:px-3.5 sm:py-2 sm:text-xs md:px-4 md:py-2 md:text-sm lg:px-5 lg:py-2 lg:text-sm 2xl:px-6 2xl:py-2.5 2xl:text-base min-[2000px]:px-7 min-[2000px]:py-3 min-[2000px]:text-lg"
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
