import ResetPasswordSection from "../../../components/sections/auth/ResetPassword/ResetPasswordSection"
import Footer from "../../../components/layout/Footer"
import "../../../styles/auth-light.css"

export default function ResetPassword() {
  return (
    <main className="auth-page">
      <ResetPasswordSection />
      <Footer />
    </main>
  )
}
