import LoginSection from "../../../components/sections/auth/Login/LoginSection"
import Footer from "../../../components/layout/Footer"
import ThemeToggle from "../../../components/ui/ThemeToggle"
import "../../../styles/auth-light.css"

export default function Login() {
  return (
    <main className="auth-page">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <LoginSection />
      <Footer />
    </main>
  )
}
