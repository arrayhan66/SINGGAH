import { UploadCloud } from "lucide-react"
import GlowBackground from "../../../ui/GlowBackground"

function UploadHero() {
  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-24 pb-12 min-[280px]:pt-28 min-[280px]:pb-14 sm:px-6 sm:pt-32 sm:pb-16 md:px-8 lg:px-12 2xl:px-16 2xl:pt-36 2xl:pb-20 3xl:px-20 3xl:pt-40 3xl:pb-24 4xl:px-24 4xl:pt-44 4xl:pb-28">
      <GlowBackground />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="flex h-12 w-12 min-[280px]:h-14 min-[280px]:w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 2xl:h-16 2xl:w-16 3xl:h-20 3xl:w-20 4xl:h-24 4xl:w-24">
          <UploadCloud className="h-6 w-6 min-[280px]:h-7 min-[280px]:w-7 text-cyan-300 2xl:h-8 2xl:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
        </div>

        <h1 className="mt-4 min-[280px]:mt-5 text-xl min-[280px]:text-2xl min-[350px]:text-3xl md:text-4xl 2xl:text-5xl 3xl:text-6xl 4xl:text-7xl font-black text-white">
          Upload Project
        </h1>

        <p className="mt-2 min-[280px]:mt-3 max-w-xl text-xs min-[280px]:text-sm min-[350px]:text-base md:text-lg text-slate-300 2xl:text-xl 3xl:text-2xl 4xl:text-3xl">
          Bagikan karya terbaikmu ke SINGGAH. Project yang kamu upload akan
          ditinjau terlebih dahulu oleh admin sebelum tampil di Hall.
        </p>
      </div>
    </section>
  )
}

export default UploadHero
