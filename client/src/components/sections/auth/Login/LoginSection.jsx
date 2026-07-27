import DustBackground from "../../../ui/DustBackground";
import GlowBackground from "../../../ui/GlowBackground";
import AuthBranding from "../shared/AuthBranding";
import LoginForm from "./LoginForm";

function LoginSection() {
  return (
    // GUE TURUTIN BANG!
    // Perhatiin class ini: min-[350px]:max-[650px]:min-h-[100dvh] min-[350px]:max-[650px]:justify-center
    // Settingan ini CUMA bakal jalan pas layar lu ukurannya di antara 350px sampai 650px.
    // Di bawah 350px form lu bakal tetep compact, di desktop (lg) dia tetep aman full screen.
    <section className="relative flex flex-col overflow-hidden bg-brand-dark px-2 py-6 sm:px-8 min-[350px]:px-6 min-[350px]:max-[650px]:min-h-[100dvh] min-[350px]:max-[650px]:justify-center lg:min-h-[100dvh] lg:flex-row lg:items-center lg:justify-center lg:py-12">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl lg:min-h-[680px] lg:flex-row 2xl:max-w-7xl 2xl:min-h-[740px]">
        <AuthBranding backTo="/" />
        <LoginForm />
      </div>
    </section>
  );
}

export default LoginSection;
