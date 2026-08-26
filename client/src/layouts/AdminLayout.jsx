import { useState } from "react"
import { ChevronDown } from "lucide-react"
import SidebarAdmin from "../components/layout/SidebarAdmin"
import AdminNavbar from "../components/layout/AdminNavbar"
import Footer from "../components/layout/Footer"
import "../styles/admin-light.css"

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem("admin-sidebar-collapsed")
    return saved === null ? false : saved === "true"
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("admin-sidebar-collapsed", String(next))
      return next
    })
  }

  const mainPad = collapsed
    ? "pl-0 min-[700px]:pl-20"
    : "pl-0 min-[700px]:pl-20 min-[1400px]:pl-64"

  return (
    <div className="admin-page min-h-screen w-full min-w-0 overflow-x-hidden bg-brand-dark">
      <AdminNavbar />
      <SidebarAdmin
        collapsed={collapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen((v) => !v)}
      />

      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "Tutup menu sidebar" : "Buka menu sidebar"}
        title={mobileOpen ? "Tutup menu sidebar" : "Buka menu sidebar"}
        className="fixed left-3 top-[4.25rem] z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-brand-dark/90 text-cyan-300 shadow-xl shadow-black/40 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-white active:scale-95 active:duration-100 min-[700px]:hidden"
      >
        <ChevronDown
          size={22}
          strokeWidth={2.5}
          className={`transition-transform duration-300 ${mobileOpen ? "rotate-180" : ""}`}
        />
      </button>

      <main className={`min-h-screen pt-14 min-[360px]:pt-16 5xl:pt-20 6xl:pt-24 transition-all duration-300 ${mainPad}`}>
        <div className="mx-auto w-full min-w-0 px-[clamp(8px,2vw,32px)] pb-[clamp(16px,3vw,48px)]">
          {children}
        </div>
      </main>
      <div className={`transition-all duration-300 ${mainPad}`}>
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
