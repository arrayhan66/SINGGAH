import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Cpu } from "lucide-react";
import logo from "../../../../assets/icons/logo.webp";
import bgloginDark from "../../../../assets/images/bg-login.webp";
import logoPoliban from "../../../../assets/icons/Logo_Poliban.png";
import { useTheme } from "../../../../context/ThemeContext";

function AuthBranding({ backTo = "/" }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const bglogin = bgloginDark;
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:p-14 2xl:p-16 lg:flex border-r border-cyan-500/20">
      <img
        src={bglogin}
        loading="lazy"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover scale-105 transition-transform duration-1000 opacity-35 mix-blend-luminosity"
      />

      <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-tr from-slate-950/95 via-night-deep/90 to-night/80" />

      <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-cyan-400/30 blur-[90px] pointer-events-none" />
      <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

      <div className="relative z-20 flex items-center justify-between w-full">
        <Link
          to={backTo}
          className="select-none group flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-night-shade px-4 py-2.5 text-xs font-semibold text-cyan-100 shadow-lg shadow-cyan-950/20 backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:border-cyan-400 hover:bg-night-shade-hover hover:text-white"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>Kembali</span>
        </Link>

        <div className="select-none hidden lg:flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/80 px-3 py-1.5 shadow-md shadow-slate-200 backdrop-blur-md">
          <img
            src={logoPoliban}
            alt="Poliban"
            className="h-4 w-4 rounded-full object-contain"
          />
          <span className="text-[11px] font-bold tracking-wide text-slate-700">
            TEKNIK ELEKTRO POLIBAN
          </span>
        </div>
      </div>

      <div className="relative z-10 my-auto py-6">
        <div className="relative overflow-hidden rounded-3xl border border-slate-300/60 bg-white/90 p-8 shadow-2xl shadow-cyan-900/20 ring-1 ring-black/[0.06] backdrop-blur-2xl">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/0 blur-xl pointer-events-none" />

          <div className="flex items-center gap-3.5 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-2 shadow-xl shadow-cyan-200/40">
              <img
                src={logo}
                alt="Logo SINGGAH"
                className="h-9 w-9 object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                SINGGAH
              </h2>
            </div>
          </div>

          <h1 className="text-[clamp(1.75rem,2.2vw,32px)] font-extrabold leading-[1.25] tracking-tight text-slate-900 mb-4">
            Gerbang Menuju <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 bg-clip-text text-transparent">
              Inovasi Digital Kampus
            </span>
          </h1>

          <p className="text-sm font-medium leading-relaxed text-slate-600 mb-6">
            Pusat kendali terpadu untuk mengelola project riset, memantau
            analitik performa, dan berkolaborasi secara real-time di lingkungan
            Jurusan Teknik Elektro Poliban.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/80">
            <div className="flex items-center gap-2.5 rounded-xl bg-cyan-50/70 p-2.5 border border-cyan-100/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm">
                <Cpu size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Smart Project
                </h4>
                <p className="text-[10px] text-slate-500">
                  Manajemen terstruktur
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-blue-50/70 p-2.5 border border-blue-100/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Secure Access
                </h4>
                <p className="text-[10px] text-slate-500">
                  Autentikasi civitas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`relative z-20 flex items-center justify-between pt-2 text-xs font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>
        <span>© {new Date().getFullYear()} Jurusan Teknik Elektro</span>
        <span className={`flex items-center gap-1.5 font-semibold ${isLight ? "text-cyan-700" : "text-cyan-300"}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          System Operational
        </span>
      </div>
    </div>
  );
}

export default AuthBranding;