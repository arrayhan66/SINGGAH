import { PenSquare, ArrowLeft, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GlowBackground from "../../../ui/GlowBackground"

function EditKaryaHero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-[calc(var(--navbar-h)+24px)] pb-10 sm:px-6 sm:pt-[calc(var(--navbar-h)+32px)] sm:pb-16 md:px-8 lg:px-12 2xl:px-16 2xl:pb-20 3xl:px-20 3xl:pb-24 4xl:px-24 4xl:pb-28">
      <GlowBackground />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <button
          onClick={() => navigate("/my-karya")}
          className="group inline-flex cursor-pointer items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 p-2 sm:py-2 sm:pl-3 sm:pr-4 text-xs text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:text-sm"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 sm:h-6 sm:w-6">
            <ArrowLeft
              size={12}
              className="transition-transform duration-300 group-hover:-translate-x-0.5 sm:size-[13px]"
            />
          </span>
          <span>Kembali ke Karya Saya</span>
        </button>

        <div className="mt-6 sm:mt-8 md:mt-10 relative">
          <span className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-2xl" />

          <span className="absolute -inset-3 rounded-[28px] border border-cyan-400/10 animate-[pulse_3s_ease-in-out_infinite]" />

          <span className="absolute -inset-6 rounded-[32px] border border-cyan-400/5 animate-[pulse_5s_ease-in-out_infinite_0.5s]" />

          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-purple-500/15 shadow-[0_0_40px_-8px_rgba(34,211,238,0.3)] backdrop-blur-xl sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 3xl:h-32 3xl:w-32 4xl:h-36 4xl:w-36">
            <PenSquare className="h-8 w-8 text-cyan-300 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 3xl:h-16 3xl:w-16 4xl:h-18 4xl:w-18 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-cyan-400/60 animate-[spin_6s_linear_infinite] sm:h-5 sm:w-5 md:-right-1.5 md:-top-1.5 md:h-6 md:w-6" />
            <Sparkles className="absolute -bottom-1 -left-1 h-3 w-3 text-purple-400/50 animate-[spin_8s_linear_infinite_reverse] sm:h-4 sm:w-4 md:-bottom-1.5 md:-left-1.5 md:h-5 md:w-5" />
          </div>
        </div>

        <h1 className="mt-4 sm:mt-5 md:mt-6 text-2xl min-[280px]:text-4xl sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl font-black">
          <span className="text-white">Edit </span>
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            Karya
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8 2xl:mt-6 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-8 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-10 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
          Perbarui informasi karya yang sudah kamu upload ke SINGGAH.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-[11px] text-slate-500 backdrop-blur-sm sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60 animate-pulse" />
          Mode Edit Aktif
        </div>
      </div>
    </section>
  )
}

export default EditKaryaHero
