import { useState, useEffect } from "react"
import SidebarAdmin from "../components/layout/SidebarAdmin"

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth < 1024
  })

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-brand-dark">
      <SidebarAdmin
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        } ml-20`}
      >
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
