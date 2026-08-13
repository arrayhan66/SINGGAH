import { useState, useRef, useEffect } from "react"
import { NavLink } from "react-router-dom"
import logo from "../../assets/icons/logo.webp"
import { visitorMenu } from "../../constants/navigation"

function NavbarVisitor() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)
  const headerRef = useRef(null)

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

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const setVar = () => {
      document.documentElement.style.setProperty(
        "--navbar-h",
        `${el.offsetHeight}px`,
      )
    }

    setVar()
    const observer = new ResizeObserver(setVar)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      ref={(node) => {
        navRef.current = node
        headerRef.current = node
      }}
      className="fixed left-0 top-0 z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    >
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2.5 backdrop-blur-xl min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-3"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-xl min-[350px]:h-9 min-[350px]:w-9 sm:h-10 sm:w-10 md:h-11 md:w-11">
            <img
              src={logo}
              alt="PamerIT Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div>
            <h1 className="text-sm font-bold text-white min-[350px]:text-base sm:text-lg">
              SINGGAH
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
            to="/login"
            onClick={closeMenu}
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 active:scale-95 min-[350px]:px-3 min-[350px]:py-2 sm:px-4 sm:py-2 sm:text-xs md:px-5 md:py-2.5 md:text-sm lg:px-6 lg:py-2.5 lg:text-base 2xl:px-8 2xl:py-3 2xl:text-lg min-[2000px]:px-10 min-[2000px]:py-4 min-[2000px]:text-xl"
          >
            LOGIN
          </NavLink>

          <button
            onClick={() => setIsOpen(!isOpen)}
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

      <div
        className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:hidden transition-all duration-300 ${
          isOpen
            ? "mt-2 opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-2"
        }`}
      >
        <div className="mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 backdrop-blur-xl">
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
