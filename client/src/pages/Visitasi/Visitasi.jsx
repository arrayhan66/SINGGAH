import MainLayout from "../../layouts/MainLayout"
import "../../styles/beranda-light.css"

export default function Visitasi() {
  return (
    <div className="beranda-page light-page">
      <MainLayout>
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Visitasi
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300">
              Segera hadir
            </p>
          </div>
        </section>
      </MainLayout>
    </div>
  )
}
