import { useState, useEffect, useCallback } from "react"
import SidebarAdmin from "../components/layout/SidebarAdmin"
import AdminNavbar from "../components/layout/AdminNavbar"

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminSidebarCollapsed")
      if (saved !== null) return JSON.parse(saved)
      return window.innerWidth < 1024
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", JSON.stringify(collapsed))
  }, [collapsed])

  const handleResize = useCallback(() => {
    if (window.innerWidth < 1024) setCollapsed(true)
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [handleResize])

  function handleToggle() {
    if (typeof window !== "undefined" && window.innerWidth < 640) return
    setCollapsed(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AdminNavbar />
      <SidebarAdmin collapsed={collapsed} onToggle={handleToggle} />

      <main className={`min-h-screen pt-16 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"} ml-16`}>
        <div className="mx-auto w-full max-w-[1800px] 3xl:max-w-[2000px] 4xl:max-w-[2400px]">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
