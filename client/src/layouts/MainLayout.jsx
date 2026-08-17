import { Navigate } from "react-router-dom"
import NavbarVisitor from "../components/layout/NavbarVisitor"
import NavbarUser from "../components/layout/NavbarUser"
import Footer from "../components/layout/Footer"
import { useAuth } from "../context/AuthContext"

function MainLayout({ children }) {
  const { user } = useAuth()

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />
  }

  const isLoggedIn = user !== null

  return (
    <div className="flex min-h-screen flex-col">
      {isLoggedIn ? <NavbarUser /> : <NavbarVisitor />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
