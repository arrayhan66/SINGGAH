import ForgotPasswordSection from "../../../components/sections/auth/ForgotPassword/ForgotPasswordSection"
import Footer from "../../../components/layout/Footer"
import ThemeToggle from "../../../components/ui/ThemeToggle"
import "../../../styles/auth-light.css"

export default function ForgotPassword() {
  return (
    <main className="auth-page">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <ForgotPasswordSection />
      <Footer />
    </main>
  )
}
