import { ArrowRight } from "lucide-react";
import DustBackground from "../../ui/DustBackground";
import GlowBackground from "../../ui/GlowBackground";
import PCBBackground from "../../ui/PCBBackground";
import HeroModel3D from "./HeroModel3D";
import logoPoliban from "../../../assets/icons/Logo_Poliban.png";
import { useNavigate } from "react-router-dom";
import HeroStats, { statsData } from "./HeroStats";

function Hero() {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden bg-brand-dark"
    >
      <GlowBackground />
      <PCBBackground />
      <DustBackground />

      {/* Class lg:items-start dihapus, jadi items-center berlaku untuk desktop juga biar sejajar */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row items-center justify-between px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-[calc(var(--navbar-h)+24px)] pb-12">
        <div className="flex w-full flex-col items-center text-center md:max-w-2xl md:mx-auto lg:max-w-xl 2xl:max-w-2xl lg:mx-0 lg:items-start lg:text-left lg:-mt-20">
          <div className="inline-flex items-center gap-2 min-[350px]:gap-3 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 min-[350px]:px-4 py-2 backdrop-blur-md">
            <img
              src={logoPoliban}
              alt="Logo Poliban"
              className="h-4 w-4 min-[350px]:h-5 min-[350px]:w-5 md:h-6 md:w-6 2xl:h-8 2xl:w-8 object-contain"
            />
            <span className="text-[10px] min-[350px]:text-xs md:text-sm 2xl:text-lg font-medium text-cyan-300">
              Politeknik Negeri Banjarmasin
            </span>
          </div>

          <h1 className="mt-4 text-3xl min-[350px]:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black leading-tight text-white">
            SINGGAH
            <br />
            SEJENAK <span className="text-cyan-300">DISINI</span>
          </h1>

          <div className="mt-5 flex flex-col md:flex-row items-center lg:items-start gap-3">
            <div className="hidden lg:block mt-2 h-13 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600" />
            <p className="text-xs min-[350px]:text-sm md:text-base lg:text-lg 2xl:text-xl leading-relaxed text-slate-300 max-w-md md:max-w-xl 2xl:max-w-2xl">
              Sebuah Karya Ciptaan Civitas Akademika{" "}
              <span className="font-semibold text-cyan-300">
                #ElektroPoliban
              </span>{" "}
              tertarik untuk kolaborasi riset?
            </p>
          </div>

          <div className="hidden lg:block mt-10 w-full">
            <button
              onClick={() => navigate("/hall")}
              className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-12 py-6 2xl:px-14 2xl:py-7 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/50"
            >
              <span className="relative flex items-center justify-between gap-4">
                <span className="text-lg tracking-wide">Mulai Eksplorasi</span>
                <ArrowRight
                  size={22}
                  className="transition-transform duration-300 group-hover:translate-x-2"
                />
              </span>
            </button>
          </div>

          <div className="hidden lg:block mt-10 w-full">
            <HeroStats />
          </div>
        </div>

        {/* Di desktop margin dibikin normal lg:mt-0 biar sejajar persis di tengah sama teks kiri */}
        <div className="mt-8 flex w-full lg:w-[45%] xl:w-1/2 items-center justify-center shrink-0 lg:-mt-20">
          <div className="w-full max-w-xs md:max-w-lg lg:max-w-full">
            <HeroModel3D />
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-lg md:max-w-2xl flex-col items-center gap-8 lg:hidden">
          <div className="w-full max-w-sm md:max-w-md">
            <button
              onClick={() => navigate("/hall")}
              className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-4 font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/50"
            >
              <span className="relative flex items-center justify-between gap-4">
                <span className="text-base tracking-wide">
                  Mulai Eksplorasi
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </span>
            </button>
          </div>

          <div className="w-full">
            <div className="flex flex-col min-[400px]:flex-row items-center justify-between gap-6 min-[400px]:gap-0 rounded-2xl border border-white/10 bg-white/5 px-4 md:px-6 py-5 min-[400px]:py-4 backdrop-blur-xl">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="relative flex w-full min-[400px]:w-auto flex-1 items-center justify-start min-[400px]:justify-center gap-4"
                  >
                    <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-cyan-300" />
                    </div>

                    <div className="text-left">
                      <p className="text-base min-[400px]:text-sm md:text-lg font-bold text-white leading-none">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] md:text-sm text-slate-400 leading-none">
                        {stat.label}
                      </p>
                    </div>

                    {index < statsData.length - 1 && (
                      <div className="hidden min-[400px]:block absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-white/20 md:h-10" />
                    )}

                    {index < statsData.length - 1 && (
                      <div className="block min-[400px]:hidden absolute -bottom-3 left-1/2 h-px w-[90%] -translate-x-1/2 bg-white/10" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(4,29,56,0.3) 55%, rgba(4,29,56,1) 100%)",
        }}
      />
    </section>
  );
}

export default Hero;
