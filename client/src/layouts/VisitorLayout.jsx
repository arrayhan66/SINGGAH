import NavbarVisitor from "../components/layout/NavbarVisitor"
import Footer from "../components/layout/Footer"

function VisitorLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarVisitor />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default VisitorLayout
