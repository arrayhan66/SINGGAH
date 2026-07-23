import DustBackground from "../../../ui/DustBackground";
import GlowBackground from "../../../ui/GlowBackground";
import LoginBranding from "./LoginBranding";
import LoginForm from "./LoginForm";

function LoginSection() {
  return (
    // px-2: Jarak layar luar dibuat sangat tipis (8px) di HP kecil
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-dark px-2 min-[350px]:px-6 sm:px-8 lg:py-12">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 flex w-full max-w-5xl 2xl:max-w-7xl lg:min-h-[680px] 2xl:min-h-[740px] flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-white/5 shadow-2xl shadow-cyan-900/40 backdrop-blur-xl lg:flex-row">
        <LoginBranding backTo="/" />
        <LoginForm />
      </div>
    </section>
  );
}

export default LoginSection;
