import { useLocation } from "react-router-dom"

import NavbarVisitor from "../components/layout/NavbarVisitor"
import NavbarUser from "../components/layout/NavbarUser"
import Footer from "../components/layout/Footer"

function MainLayout({ children }) {
  const location = useLocation()

  const isUserRoute = location.pathname.startsWith("/user")

  return (
    <>
      {isUserRoute ? (
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
