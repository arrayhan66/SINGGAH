import { Home, ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import DustBackground from "../../components/ui/DustBackground"
import GlowBackground from "../../components/ui/GlowBackground"
import PCBBackground from "../../components/ui/PCBBackground"

function NotFoundContent() {
  const navigate = useNavigate()

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden bg-brand-dark px-5 pt-28 pb-12 md:pt-40 md:pb-16">
      {/* GlowBackground */}
      <GlowBackground />

      {/* PCBBackground */}
      <PCBBackground />

      {/* DustBackground */}
      <DustBackground />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Judul */}
        <h1 className="text-8xl font-black text-transparent bg-gradient-to-b from-cyan-300 to-blue-600 bg-clip-text sm:text-9xl">
          404
        </h1>

        <h2 className="mt-4 text-xl font-bold text-white sm:text-2xl">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          Sepertinya halaman yang kamu cari sudah dipindah, dihapus, atau memang
          tidak pernah ada. Coba kembali ke beranda atau halaman sebelumnya.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-400/50"
          >
            <Home size={18} />
            Ke Beranda
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundContent
