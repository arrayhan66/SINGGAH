import { useState, useRef, useEffect } from "react"
import { User } from "lucide-react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/icons/logo.png"
import { visitorMenu } from "../../constants/navigation"

function NavbarVisitor() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)

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
      ref={navRef}
      className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 md:px-8"
    >
      <div className="mx-auto mt-3 sm:mt-4 md:mt-5 flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 sm:px-6 sm:py-4 md:px-8 backdrop-blur-xl">
        {/* LOGO */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 sm:gap-3"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center overflow-hidden rounded-xl shrink-0">
            <img
              src={logo}
              alt="PamerIT Logo"
              className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain"
            />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              SINGGAH
            </h1>
          </div>
        </NavLink>

        {/* Menu - Desktop */}
        <nav className="hidden gap-6 font-medium lg:mr-10 lg:flex lg:gap-10">
          {visitorMenu.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink
            to="/login"
            onClick={closeMenu}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue text-white transition-all duration-300 hover:bg-[#5b8dbc] sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-11 lg:w-11"
            aria-label="Login"
          >
            <User size={13} className="sm:hidden" />
            <User size={14} className="hidden sm:block md:hidden" />
            <User size={16} className="hidden md:block lg:hidden" />
            <User size={20} className="hidden lg:block" />
          </NavLink>

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
          isOpen ? "mt-2 max-h-[500px] opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(73,126,174,.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(73,126,174,.3) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />

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
                      ? "bg-cyan-400/10 text-cyan-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
                  }`
                }
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/40 transition-all duration-300 group-hover:w-4 group-hover:bg-cyan-400" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default NavbarVisitor
