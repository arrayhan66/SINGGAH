import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import logo from "../../../../assets/icons/logo.png"
import bglogin from "../../../../assets/images/bg-login.jpg"
import logoPoliban from "../../../../assets/icons/Logo_Poliban.png"

function LoginBranding({ backTo = "/" }) {
  return (
    <div className="relative hidden w-1/2 flex-col overflow-hidden bg-white p-12 lg:flex border-r border-cyan-900/20">
      {/* LEFT BACKGROUND */}
      <img
        src={bglogin}
        loading="lazy"
        alt="White Abstract Background"
        className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply"
      />

      {/* Glow Efek */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-200/50 blur-[80px]" />
      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-blue-300/40 blur-[100px]" />

      {/* Kembali Button */}
      <Link
        to={backTo}
        className="select-none absolute left-8 top-8 z-20 flex items-center gap-2 rounded-xl border-2 border-cyan-300 bg-[#0B2F4A] px-4 py-3 text-sm font-medium text-white backdrop-blur-xl transition-all duration-300 hover:-translate-x-1 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-300/20"
      >
        <ArrowLeft size={18} />
        <span>Kembali</span>
      </Link>

      {/* Main Kontainer */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col justify-center px-8">
        {/* Logo */}
        <div className="select-none mb-6 mt-8 flex items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-white p-1.5 shadow-xl shadow-cyan-200/20 transition-all duration-300 hover:scale-105">
            <img
              src={logo}
              alt="Logo SINGGAH"
              className="h-10 w-10 object-contain"
            />
          </div>

          <span className="text-xl font-black tracking-[0.08em] text-slate-800">
            SINGGAH
          </span>
        </div>

        {/* Informasi */}
        <div className="w-fit max-w-[420px]">
          <div className="select-none mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[#0B2F4A]/85 px-3 py-1.5 backdrop-blur-md shadow-lg shadow-cyan-900/10 hover:bg-[#103b5e] transition-all duration-300">
            <img
              src={logoPoliban}
              alt="Logo Poliban"
              className="h-5 w-5 rounded-full bg-white p-[2px]"
            />

            <span className="text-xs font-medium text-cyan-100">
              Politeknik Negeri Banjarmasin
            </span>
          </div>

          {/* Judul */}
          <div className="w-fit">
            <h1 className="select-none text-[clamp(2rem,3vw,42px)] font-extrabold leading-[1.25] tracking-[-0.03em] text-slate-900">
              Gerbang Menuju <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Inovasi Digital
              </span>
            </h1>

            {/* Garis */}
            <div className="relative mt-6 h-[3px] w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500">
              <div className="absolute -right-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 bg-cyan-500" />
            </div>

            {/* Paragraf */}
            <p className="select-none mt-5 w-full text-[15px] leading-7 text-left font-medium text-slate-600">
              Masuk untuk mengelola project, melihat analitik, dan berkolaborasi
              dengan civitas akademika Elektro Poliban.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginBranding
