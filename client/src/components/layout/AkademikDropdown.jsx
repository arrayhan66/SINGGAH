import { useEffect, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { akademikMenu } from "../../constants/navigation"
import "../../styles/akademik-nav.css"

export default function AkademikDropdown() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const wrapperRef = useRef(null)

  const isActive = akademikMenu.items.some(
    (item) => location.pathname === item.to,
  )

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onClickOutside)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onClickOutside)
    }
  }, [open])

  useEffect(
    () => () => {
      window.clearTimeout(closeTimer.current)
    },
    [],
  )

  const show = () => {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const hide = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 70)
  }

  return (
    <div
      ref={wrapperRef}
      className="ak-nav-dropdown"
      onMouseEnter={show}
      onMouseLeave={hide}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        className={`snav-link${isActive ? " is-active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={isActive ? "page" : undefined}
      >
        <span>{akademikMenu.label}</span>
        <ChevronDown
          size={14}
          className={`ml-1 inline-block transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`ak-nav-pop ${open ? "is-open" : ""}`}>
        <div className="ak-nav-pop__panel" role="menu">
          <div className="ak-nav-pop__inner">
            {akademikMenu.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={({ isActive: active }) =>
                  `ak-nav-pop__item ${active ? "is-active" : ""}`
                }
              >
                <span className="ak-nav-pop__title">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
