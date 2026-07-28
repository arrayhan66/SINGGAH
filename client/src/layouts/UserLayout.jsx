import NavbarUser from "../components/layout/NavbarUser"
import Footer from "../components/layout/Footer"

function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarUser />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default UserLayout
