import { useLocation } from "react-router-dom"

import NavbarVisitor from "../components/layout/NavbarVisitor"
import NavbarUser from "../components/layout/NavbarUser"
import Footer from "../components/layout/Footer"
import { useAuth } from "../context/AuthContext"

function MainLayout({ children }) {
  const location = useLocation()
  const { user } = useAuth()

  const isUserRoute = location.pathname.startsWith("/user")
  const isLoggedIn = user !== null

  return (
    <>
      {isUserRoute || isLoggedIn ? (
        <NavbarUser name="Raihan" role="Mahasiswa" />
      ) : (
        <NavbarVisitor />
      )}

      <main>{children}</main>

      <Footer />
    </>
  )
}

export default MainLayout
