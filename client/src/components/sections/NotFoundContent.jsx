import { Home, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import DustBackground from "../../components/ui/DustBackground"
import GlowBackground from "../../components/ui/GlowBackground"
import PCBBackground from "../../components/ui/PCBBackground"

function NotFoundContent() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-navy px-5 pt-[calc(var(--navbar-h)+16px)] pb-12 sm:pt-[calc(var(--navbar-h)+24px)] sm:pb-16 md:pb-20 lg:pb-24 3xl:pb-28 4xl:pb-32">
      <GlowBackground />
      <PCBBackground />
      <DustBackground />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 */}
        <h1 className="text-7xl font-black text-transparent bg-gradient-to-b from-cyan-300 to-blue-600 bg-clip-text sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] 2xl:text-[14rem] 3xl:text-[16rem] 4xl:text-[20rem]">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 text-lg font-bold text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl sm:mt-5 md:mt-6 lg:mt-8 3xl:mt-10 4xl:mt-12">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg md:max-w-lg lg:text-xl lg:max-w-xl xl:text-xl 2xl:mt-4 2xl:max-w-2xl 2xl:text-2xl 3xl:mt-5 3xl:max-w-3xl 3xl:text-3xl 4xl:mt-6 4xl:max-w-4xl 4xl:text-4xl">
          Sepertinya halaman yang kamu cari sudah dipindah, dihapus, atau memang
          tidak pernah ada. Coba kembali ke beranda atau halaman sebelumnya.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:mt-10 md:mt-12 lg:mt-14 3xl:mt-16 4xl:mt-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/10 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-7 md:py-3.5 md:text-sm lg:text-base 3xl:px-8 3xl:py-4 3xl:text-base 4xl:px-10 4xl:py-5 4xl:text-lg"
          >
            <ArrowLeft size={16} className="sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6" />
            Kembali
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition duration-300 hover:shadow-cyan-400/50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-7 md:py-3.5 md:text-sm lg:text-base 3xl:px-8 3xl:py-4 3xl:text-base 4xl:px-10 4xl:py-5 4xl:text-lg"
          >
            <Home size={16} className="sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundContent
