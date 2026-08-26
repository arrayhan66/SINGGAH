import DustBackground from "../../../ui/DustBackground"
import GlowBackground from "../../../ui/GlowBackground"
import AuthBranding from "../shared/AuthBranding"
import VerifyCodeForm from "./VerifyCodeForm"

function VerifyCodeSection() {
  const verifyType = localStorage.getItem("verifyType")
  const backTo =
    verifyType === "profile"
      ? "/profile"
      : verifyType === "register"
        ? "/register"
        : "/forgot-password"

  return (
    <section className="relative flex flex-col overflow-hidden bg-brand-dark px-2 py-6 sm:px-8 min-[350px]:px-6 min-[350px]:min-h-[100dvh] min-[350px]:justify-center lg:min-h-[100dvh] lg:flex-row lg:items-center lg:justify-center lg:py-12">
      <GlowBackground />
      <DustBackground />
      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl lg:min-h-[680px] lg:flex-row 2xl:max-w-7xl 2xl:min-h-[740px]">
        <AuthBranding backTo={backTo} />
        <VerifyCodeForm />
      </div>
    </section>
  )
}

export default VerifyCodeSection
