import VerifyCodeSection from "../../../components/sections/auth/VerifyCode/VerifyCodeSection"
import Footer from "../../../components/layout/Footer"
import ThemeToggle from "../../../components/ui/ThemeToggle"
import "../../../styles/auth-light.css"

export default function VerifyCode() {
  return (
    <main className="auth-page">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <VerifyCodeSection />
      <Footer />
    </main>
  )
}
