import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import LoginBranding from "../Login/LoginBranding"
import ForgotPasswordForm from "./ForgotPasswordForm"

function ForgotPasswordSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-dark px-4 min-[350px]:px-6 py-6 sm:px-8">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl min-h-[430px] min-[350px]:min-h-[470px] sm:min-h-[560px] lg:h-[560px] lg:flex-row">
        <LoginBranding backTo="/login" />

        <ForgotPasswordForm />
      </div>
    </section>
  )
}

export default ForgotPasswordSection
