import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import KaryaProjectCard from "./KaryaProjectCard"
import { karyaCategories, karyaProjects } from "../../../data/karyaData"

const INITIAL_COUNT = 6

function KaryaProjectSection() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const category = karyaCategories.find((item) => item.slug === slug)
  const categoryProjects = karyaProjects.filter(
    (item) => item.category === slug,
  )

  const {
    search,
    handleSearchChange,
    visibleData: visibleProjects,
    filteredData: filteredProjects,
    showAll,
    setShowAll,
  } = useSearchAndExpand(categoryProjects, INITIAL_COUNT)

  if (!category) {
    return (
      <section className="relative overflow-hidden bg-brand-navy py-20 text-center">
        <p className="text-slate-300">Kategori tidak ditemukan.</p>
        <button
          onClick={() => navigate("/karya")}
          className="mt-6 rounded-xl border border-cyan-400/30 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
        >
          Kembali
        </button>
      </section>
    )
  }

  return (
    <section
      id="karya-detail"
      className="relative overflow-hidden bg-brand-navy pt-28 pb-6 sm:pt-32 sm:pb-10 lg:pt-36 lg:pb-12"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative">
        <Link
          to="/karya"
          className="group absolute left-5 top-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-4 text-sm text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:left-8"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20">
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </span>
          Kembali
        </Link>

        <div className="text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            {category.title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {category.desc}
          </p>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari karya..."
        />

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.length > 0 ? (
            visibleProjects.map((project) => (
              <KaryaProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="col-span-full text-center text-slate-400">
              Karya tidak ditemukan.
            </p>
          )}
        </div>

        {!showAll && filteredProjects.length > INITIAL_COUNT && (
          <div className="mt-6 flex justify-center sm:mt-8">
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
