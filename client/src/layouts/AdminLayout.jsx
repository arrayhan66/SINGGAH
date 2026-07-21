import { useState } from "react"
import SidebarAdmin from "../components/layout/SidebarAdmin"

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-brand-dark">
      <SidebarAdmin
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  )
}

export default AdminLayout