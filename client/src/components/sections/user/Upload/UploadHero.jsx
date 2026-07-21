import { UploadCloud } from "lucide-react"
import GlowBackground from "../../../ui/GlowBackground"

function UploadHero() {
  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-28 pb-16 md:px-12 md:pt-32 md:pb-20">
      <GlowBackground />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30">
          <UploadCloud className="h-7 w-7 text-cyan-300" />
        </div>

        <h1 className="mt-5 text-2xl min-[350px]:text-3xl md:text-4xl font-black text-white">
          Upload Project
        </h1>

        <p className="mt-3 max-w-xl text-xs min-[350px]:text-sm md:text-base text-slate-300">
          Bagikan karya terbaikmu ke SINGGAH. Project yang kamu upload akan
          ditinjau terlebih dahulu oleh admin sebelum tampil di Hall.
        </p>
      </div>
    </section>
  )
}

export default UploadHero
