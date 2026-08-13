import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import KaryaProjectCard from "./KaryaProjectCard"
import api from "../../../services/api"

function KaryaProjectSection() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const initialCount = 6

  const [category, setCategory] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/categories"),
      api.get(`/projects?category=${slug}`)
    ])
      .then(([catRes, projRes]) => {
        const cats = catRes.data.data.items || catRes.data.data || []
        const found = cats.find((c) => c.slug === slug)
        setCategory(found)
        const projs = projRes.data.data.items || projRes.data.data || []
        setProjects(projs)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load category projects:", err)
        setLoading(false)
      })
  }, [slug])

  const {
    search,
    handleSearchChange,
    visibleData: visibleProjects,
    filteredData: filteredProjects,
    showAll,
    setShowAll,
  } = useSearchAndExpand(projects, initialCount)

  if (!category) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-dark py-16 text-center sm:py-20 md:py-24 lg:py-28 3xl:py-32 4xl:py-40">
        <div className="relative z-10 flex flex-col items-center px-4">
          <p className="text-lg font-semibold text-slate-300 sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl">
            Kategori tidak ditemukan.
          </p>
          <button
            onClick={() => navigate("/karya")}
            className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 sm:mt-6 sm:px-5 sm:py-3 sm:text-sm md:text-base lg:mt-8 lg:px-6 lg:py-3.5 3xl:px-8 3xl:py-4 3xl:text-lg 4xl:text-xl"
          >
            Kembali ke Daftar Kategori
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="karya-detail"
      className="relative min-h-screen overflow-hidden bg-brand-dark pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-18 3xl:pb-20 4xl:pb-24"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12 relative xl:max-w-[1280px] 3xl:max-w-[1600px] 3xl:px-14 4xl:max-w-[2000px] 4xl:px-16">
        <div className="mb-2 flex sm:-mb-2 lg:-mb-4 3xl:-mb-6 4xl:-mb-8">
          <Link
            to="/karya"
            aria-label="Kembali"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 sm:py-2 sm:pl-3 sm:pr-4 text-xs text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:text-sm md:py-2.5 md:pl-3.5 md:pr-4.5 lg:py-3 lg:pl-4 lg:pr-5 lg:text-base 3xl:text-base 4xl:py-3.5 4xl:pl-5 4xl:pr-6 4xl:text-lg"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 3xl:h-9 3xl:w-9 4xl:h-10 4xl:w-10">
              <ArrowLeft
                size={12}
                className="transition-transform duration-300 group-hover:-translate-x-0.5 sm:size-[13px] md:size-3.5 lg:size-4 3xl:size-[18px] 4xl:size-5"
              />
            </span>
            <span className="hidden sm:inline">Kembali</span>
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 3xl:text-6xl 4xl:text-7xl">
            {category.title}
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:max-w-2xl sm:text-base sm:leading-7 md:text-base lg:text-lg xl:text-lg 3xl:mt-5 3xl:max-w-3xl 3xl:text-xl 3xl:leading-8 4xl:mt-6 4xl:max-w-4xl 4xl:text-2xl 4xl:leading-9">
            {category.desc}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 3xl:mt-10 4xl:mt-12">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder={`Cari di kategori ${category.title}...`}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 sm:mt-10 md:gap-7 lg:grid-cols-3 lg:gap-8 xl:gap-9 3xl:mt-16 3xl:grid-cols-4 3xl:gap-10 4xl:mt-20 4xl:grid-cols-5 4xl:gap-12">
          {visibleProjects.length > 0 ? (
            visibleProjects.map((project) => (
              <KaryaProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-28 4xl:py-32">
              <div className="mb-4 rounded-full bg-slate-800/50 p-3 ring-1 ring-slate-700/50 backdrop-blur-sm sm:mb-5 sm:p-4 3xl:p-5 4xl:p-6">
                <svg
                  className="h-8 w-8 text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-200 sm:text-xl 3xl:text-2xl 4xl:text-3xl">
                Karya tidak ditemukan
              </h3>
              <p className="mt-2 max-w-sm text-center text-xs text-slate-400 sm:max-w-md sm:text-sm md:text-base lg:text-base 3xl:mt-3 3xl:text-lg 4xl:text-xl">
                Maaf, kami tidak menemukan karya yang cocok dengan kata kunci{" "}
                <span className="font-semibold text-slate-300">&quot;{search}&quot;</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredProjects.length > initialCount && (
          <div className="mt-6 flex justify-center sm:mt-8 md:mt-10 3xl:mt-12 4xl:mt-14">
            <OutlineButton onClick={() => setShowAll(true)}>
              Lihat Lebih Banyak
            </OutlineButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default KaryaProjectSection
