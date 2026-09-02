import { useState, useRef, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import logo from "../../assets/icons/logo.webp"
import { visitorMenu } from "../../constants/navigation"
import { prefetchRouteFromLink } from "../../utils/routePrefetch"
import ThemeToggle from "../ui/ThemeToggle"
import { itemSubtitle, itemAccent, itemActive, itemHover } from "./menuConstants"

function NavbarVisitor() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)
  const headerRef = useRef(null)

const navLinkClass = ({ isActive, label }) => {
  const activePill = {
    Beranda: "bg-cyan-400/10 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.15)]",
    Karya: "bg-indigo-400/10 text-indigo-300 shadow-[0_0_18px_rgba(129,140,248,.15)]",
    Tentang: "bg-amber-400/10 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,.15)]",
    Berita: "bg-sky-400/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,.15)]",
  }
  const hoverPill = {
    Beranda: "hover:text-cyan-300",
    Karya: "hover:text-indigo-300",
    Tentang: "hover:text-amber-300",
    Berita: "hover:text-sky-300",
  }
  return `relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
    isActive
      ? (activePill[label] || activePill.Beranda)
      : `text-slate-300 hover:bg-white/5 hover:-translate-y-0.5 ${hoverPill[label] || "hover:text-cyan-300"}`
  }`
}

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

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
      <div className="mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl border border-white/10 bg-[#132d4d] px-2.5 py-2.5 backdrop-blur-xl min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10">
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
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRouteFromLink(item.to)}
              className={({ isActive }) => navLinkClass({ isActive, label: item.label })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 min-[350px]:gap-2 sm:gap-4">
          <ThemeToggle />
          <NavLink
            to="/login"
            onClick={closeMenu}
            className="group relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-2 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-cyan-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40 active:scale-95 min-[350px]:px-3 min-[350px]:py-1.5 min-[350px]:text-[11px] sm:px-3.5 sm:py-2 sm:text-xs md:px-4 md:py-2 md:text-sm lg:px-5 lg:py-2 lg:text-sm 2xl:px-6 2xl:py-2.5 2xl:text-base min-[2000px]:px-7 min-[2000px]:py-3 min-[2000px]:text-lg"
          >
            Login
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
        className={`absolute left-0 top-full z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:hidden max-h-[calc(100dvh-var(--navbar-h)-1.25rem)] overflow-y-auto overscroll-contain transition-all duration-200 ${
          isOpen
            ? "mt-2 translate-y-0 opacity-100 visible"
            : "-translate-y-2 opacity-0 invisible pointer-events-none"
        }`}
      >
        <div
          className={`mobile-menu-shell relative mx-auto max-w-[1700px] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark/95 shadow-[0_32px_80px_-24px_rgba(1,8,20,0.9)] backdrop-blur-2xl transition-transform duration-200 ease-out ${
            isOpen ? "scale-100" : "scale-95"
          }`}
        >
          <span
            aria-hidden="true"
            className="menu-hairline pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
          />
          <span
            aria-hidden="true"
            className="menu-glow pointer-events-none absolute -top-24 -right-14 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl"
          />
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

          <nav className="relative flex flex-col gap-2 p-3">
            {visitorMenu.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMenu}
                  style={{
                    transitionDelay: isOpen ? `${index * 70}ms` : "0ms",
                  }}
                  onMouseEnter={() => prefetchRouteFromLink(item.to)}
                  className={({ isActive }) =>
                    `mobile-menu-item group relative flex cursor-pointer items-center gap-3.5 rounded-2xl border px-3.5 py-3 transition-[transform,opacity,background-color,color,border-color] duration-300 ${
                      isOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-4 opacity-0"
                    } ${
                      isActive
                        ? itemActive[item.label] || itemActive.Beranda
                        : "border-transparent bg-white/[0.03] hover:bg-white/[0.06] " +
                          (itemHover[item.label] || "hover:text-cyan-300")
                    }`
                  }
                >
                  <span className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ${
                      itemAccent[item.label] || itemAccent.Karya
                    }`}
                  >
                    <ItemIcon size={18} strokeWidth={2} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className={`mobile-menu-item-label block text-[15px] font-medium leading-tight text-slate-200 transition-colors ${itemHover[item.label] || "hover:text-cyan-300"}`}>
                      {item.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {itemSubtitle[item.label] || ""}
                    </span>
                  </span>

                  <ArrowUpRight
                      size={17}
                      className="shrink-0 text-slate-500 opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300 group-hover:opacity-100"
                    />
                  </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default NavbarVisitor
