import LoginSection from "../../../components/sections/auth/Login/LoginSection"
import Footer from "../../../components/layout/Footer"
import "../../../styles/auth-light.css"

export default function Login() {
  return (
    <main className="auth-page">
      <LoginSection />
      <Footer />
    </main>
  )
}
