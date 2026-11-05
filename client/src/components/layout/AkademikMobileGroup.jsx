import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { akademikMenu } from "../../constants/navigation"
import "../../styles/akademik-nav.css"

export default function AkademikMobileGroup({ onNavigate }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const isActive = akademikMenu.items.some(
    (item) => location.pathname === item.to,
  )

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <div className={`ak-mnav ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className={`ak-mnav__trigger ${isActive ? "is-active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="ak-mnav__body">
          <strong>{akademikMenu.label}</strong>
        </span>
        <ChevronDown
          size={17}
          className={`ak-mnav__chevron ${open ? "is-open" : ""}`}
        />
      </button>

      <div className="ak-mnav__sub">
        <div className="ak-mnav__sub-inner">
          {akademikMenu.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={({ isActive: active }) =>
                `ak-mnav__item ${active ? "is-active" : ""}`
              }
            >
              <span className="ak-mnav__item-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
