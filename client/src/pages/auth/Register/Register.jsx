import RegisterSection from "../../../components/sections/auth/Register/RegisterSection"
import Footer from "../../../components/layout/Footer"
import "../../../styles/auth-light.css"

export default function Register() {
  return (
    <main className="auth-page">
      <RegisterSection />
      <Footer />
    </main>
  )
}
