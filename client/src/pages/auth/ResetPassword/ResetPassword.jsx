import ResetPasswordSection from "../../../components/sections/auth/ResetPassword/ResetPasswordSection"
import Footer from "../../../components/layout/Footer"
import ThemeToggle from "../../../components/ui/ThemeToggle"
import "../../../styles/auth-light.css"

export default function ResetPassword() {
  return (
    <main className="auth-page">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <ResetPasswordSection />
      <Footer />
    </main>
  )
}
