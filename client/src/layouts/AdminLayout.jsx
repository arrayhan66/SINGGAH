import { useState, useEffect, useCallback } from "react"
import SidebarAdmin from "../components/layout/SidebarAdmin"
import AdminNavbar from "../components/layout/AdminNavbar"
import Footer from "../components/layout/Footer"

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    const saved = localStorage.getItem("admin-sidebar-collapsed")
    return saved === null ? false : saved === "true"
  })

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1024) setCollapsed(true)
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [handleResize])

  function handleToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 640) return
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("admin-sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AdminNavbar />
      <SidebarAdmin collapsed={collapsed} onToggle={handleToggle} />

      <main className={`min-h-screen pt-16 transition-all duration-300 ${collapsed ? "ml-0 lg:ml-20 5xl:ml-24 6xl:ml-24" : "ml-0 lg:ml-56 5xl:ml-64 6xl:ml-72"} min-[260px]:ml-0`}>
        <div className="mx-auto w-full min-w-0 px-3 min-[260px]:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24 6xl:px-28">
          <div className="mx-auto w-full min-w-0 max-w-[1800px] min-[2200px]:max-w-[2000px] min-[2800px]:max-w-[2400px] min-[3600px]:max-w-[3400px] min-[4400px]:max-w-[4200px]">
            {children}
          </div>
        </div>
      </main>
      <div className={`transition-all duration-300 ${collapsed ? "ml-0 lg:ml-20 5xl:ml-24 6xl:ml-24" : "ml-0 lg:ml-56 5xl:ml-64 6xl:ml-72"} min-[260px]:ml-0`}>
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout
