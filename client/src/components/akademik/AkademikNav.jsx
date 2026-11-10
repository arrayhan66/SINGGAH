import { NavLink } from "react-router-dom"
import { CalendarDays, Compass, Users } from "lucide-react"

const items = [
  { to: "/akademik/tur-virtual", label: "Tur Virtual", icon: Compass },
  { to: "/akademik/dosen", label: "Daftar Dosen", icon: Users },
  { to: "/akademik/jadwal-ruangan", label: "Jadwal Ruangan", icon: CalendarDays },
]

export default function AkademikNav() {
  return (
    <nav className="ak-subnav" aria-label="Lingkungan akademik">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `ak-subnav__item ${isActive ? "is-active" : ""}`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
