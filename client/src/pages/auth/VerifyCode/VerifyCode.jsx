import VerifyCodeSection from "../../../components/sections/auth/VerifyCode/VerifyCodeSection"
import Footer from "../../../components/layout/Footer"
import "../../../styles/auth-light.css"

export default function VerifyCode() {
  return (
    <main className="auth-page">
      <VerifyCodeSection />
      <Footer />
    </main>
  )
}
