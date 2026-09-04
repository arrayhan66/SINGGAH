import { UploadCloud } from "lucide-react"
import GlowBackground from "../../../ui/GlowBackground"
import { useTheme } from "../../../../context/ThemeContext"

const darkVignette =
  "radial-gradient(circle at top center, transparent 0%, rgba(4,29,56,0.2) 50%, rgba(4,29,56,0.85) 100%)"
const lightVignette =
  "radial-gradient(circle at top center, transparent 0%, rgba(37,99,235,0.05) 50%, rgba(30,64,120,0.16) 100%)"

function UploadHero() {
  const { theme } = useTheme()

  return (
    <section className="hero relative overflow-hidden bg-brand-dark px-4 pt-[calc(var(--navbar-h)+24px)] pb-10 sm:px-6 sm:pt-[calc(var(--navbar-h)+32px)] sm:pb-16 md:px-8 lg:px-12 2xl:px-16 2xl:pb-20 3xl:px-20 3xl:pb-24 4xl:px-24 4xl:pb-28">
      <GlowBackground />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: theme === "light" ? lightVignette : darkVignette }}
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
          <UploadCloud className="h-8 w-8 text-cyan-300 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
        </div>

        <h1 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-2xl min-[280px]:text-4xl sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl font-black text-white">
          Upload <span className="text-cyan-300">Karya</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
          Bagikan karya terbaikmu dan jadilah bagian dari galeri SINGGAH.
          Karya akan melalui proses tinjauan admin dahulu sebelum hadir
          di Hall.
        </p>
      </div>
    </section>
  )
}

export default UploadHero
