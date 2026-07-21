// File: src/components/auth/LoginSection.jsx
import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import LoginBranding from "./LoginBranding"
import LoginForm from "./LoginForm"

function LoginSection() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-dark px-4 min-[350px]:px-6 py-12 sm:px-8">
      {/* Background Effects */}
      <GlowBackground />
      <DustBackground />

      {/* Main Kontainer */}
      {/* PERUBAHAN: border-white/10 diganti jadi border-cyan-400/40 agar dikelilingi border biru */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl lg:flex-row">
        {/* Sisi Kiri (Branding Visual) */}
        <LoginBranding backTo="/" />

        {/* Sisi Kanan (Form & Logic) */}
        <LoginForm />
      </div>
    </section>
  )
}

export default LoginSection
