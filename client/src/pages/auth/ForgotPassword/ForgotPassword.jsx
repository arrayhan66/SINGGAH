import ForgotPasswordSection from "../../../components/sections/auth/ForgotPassword/ForgotPasswordSection"
import Footer from "../../../components/layout/Footer"
import "../../../styles/auth-light.css"

export default function ForgotPassword() {
  return (
    <main className="auth-page">
      <ForgotPasswordSection />
      <Footer />
    </main>
  )
}
