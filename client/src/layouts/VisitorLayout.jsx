import NavbarVisitor from "../components/layout/NavbarVisitor"
import Footer from "../components/layout/Footer"

function VisitorLayout({ children }) {
  return (
    <>
      <NavbarVisitor />
      {children}
      <Footer />
    </>
  )
}

export default VisitorLayout
