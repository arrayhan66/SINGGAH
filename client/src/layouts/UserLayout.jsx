import NavbarUser from "../components/layout/NavbarUser"
import Footer from "../components/layout/Footer"

function UserLayout({ children }) {
  return (
    <>
      <NavbarUser />
      {children}
      <Footer />
    </>
  )
}

export default UserLayout
