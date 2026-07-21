import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import LoginBranding from "../Login/LoginBranding"
import RegisterForm from "./RegisterForm"

function RegisterSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-dark px-4 py-12 min-[350px]:px-6 sm:px-8">
      {/* Background Effects */}
      <GlowBackground />
      <DustBackground />

      {/* Main Kontainer */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl lg:flex-row">
        {/* Sisi Kiri (Branding Visual) - Kita pakai ulang dari komponen Login */}
        <LoginBranding backTo="/login" />

        {/* Sisi Kanan (Form & Logic) */}
        <RegisterForm />
      </div>
    </section>
  )
}

export default RegisterSection
