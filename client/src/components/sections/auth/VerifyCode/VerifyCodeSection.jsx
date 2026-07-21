import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import LoginBranding from "../Login/LoginBranding"
import VerifyCodeForm from "./VerifyCodeForm"

function VerifyCodeSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-dark px-4 py-6 min-[350px]:px-6 sm:px-8">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 flex min-h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl sm:min-h-[560px] lg:h-[560px] lg:flex-row">
        <LoginBranding backTo="/forgot-password" />

        <VerifyCodeForm />
      </div>
    </section>
  )
}

export default VerifyCodeSection
