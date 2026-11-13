import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Library, ArrowLeft } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import PCBBackground from "../../ui/PCBBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import { KaryaPageSkeleton } from "../../ui/PageSkeletons"
import KaryaCategoryCard from "./KaryaCategoryCard"
import KaryaProjectCard from "./KaryaProjectCard"
import { isCategoryActive } from "../../../utils/categoryHelpers"
import api from "../../../services/api"

const FALLBACK_CATEGORIES = [
  { name: "Website", slug: "website", description: "Situs web modern dan responsif.", color: "#3b82f6" },
  { name: "Mobile App", slug: "mobile-app", description: "Aplikasi Android & iOS.", color: "#a78bfa" },
  { name: "IoT", slug: "iot", description: "Perangkat pintar dan sistem otomatis.", color: "#06b6d4" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Kecerdasan buatan untuk solusi nyata.", color: "#ec4899" },
  { name: "Data Science", slug: "data-science", description: "Analisis data dan visualisasi.", color: "#34d399" },
  { name: "Cyber Security", slug: "cyber-security", description: "Keamanan jaringan dan sistem.", color: "#fbbf24" },
  { name: "UI/UX Design", slug: "ui-ux-design", description: "Desain antarmuka dan pengalaman pengguna.", color: "#fb7185" },
  { name: "Game Development", slug: "game-development", description: "Pengembangan game 2D/3D.", color: "#a855f7" },
]

function KaryaSection() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const qParam = searchParams.get("q") || ""
  const jurusanParam = searchParams.get("jurusan") || ""
  const tahunParam = searchParams.get("tahun") || ""

  const hasFilter = Boolean(qParam || jurusanParam || tahunParam)

  const initialCount = 6
  const [categories, setCategories] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/categories").catch(() => ({ data: { data: FALLBACK_CATEGORIES } })),
      api.get("/projects?limit=100").catch(() => ({ data: { data: { items: [] } } }))
    ])
      .then(([catRes, projRes]) => {
        const catItems = catRes.data.data.items || catRes.data.data || []
        setCategories(catItems.filter(isCategoryActive))
        const projItems = projRes.data.data.items || projRes.data.data || []
        setProjects(projItems)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter projects client-side based on searchParams
  const filteredProjects = projects.filter((p) => {
    if (qParam) {
      const qLower = qParam.toLowerCase()
      const titleMatch = p.title?.toLowerCase().includes(qLower)
      const descMatch = p.description?.toLowerCase().includes(qLower)
      if (!titleMatch && !descMatch) return false
    }
    if (jurusanParam) {
      const catSlug = p.Category?.slug || p.category || ""
      if (catSlug !== jurusanParam) return false
    }
    if (tahunParam) {
      if (String(p.year) !== String(tahunParam)) return false
    }
    return true
  })

  const {
    search,
    handleSearchChange,
    visibleData: visibleCategories,
    filteredData: filteredCategories,
    showAll,
    setShowAll,
  } = useSearchAndExpand(categories, initialCount)

  function handleCategoryClick(slug) {
    navigate(`/karya/${slug}`)
  }

  function handleClearFilter() {
    setSearchParams({})
  }

  return (
    <section
      id="karya"
      className="relative overflow-hidden bg-brand-dark min-h-screen pt-[calc(var(--navbar-h)+24px)] sm:pt-[calc(var(--navbar-h)+32px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <GlowBackground />
      <PCBBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
        {loading ? (
          <KaryaPageSkeleton />
        ) : (
          <>
            {hasFilter && (
              <div className="mb-4 flex">
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-[7px] pl-[15px] pr-[17px] text-xs text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20">
                    <ArrowLeft size={13} />
                  </span>
                  <span>Kembali ke Semua Kategori</span>
                </button>
              </div>
            )}

            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24">
                <Library className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12" />
              </div>
              <h2 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                {hasFilter ? "Hasil Pencarian Karya" : <>Karya <span className="text-cyan-300">SinggaH</span></>}
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                {hasFilter ? (
                  <>Menemukan {filteredProjects.length} karya berdasarkan filter pencarian.</>
                ) : (
                  <>Jelajahi seluruh karya mahasiswa Politeknik Negeri Banjarmasin.</>
                )}
              </p>
            </div>

            {!hasFilter && (
              <div className="mt-8 2xl:mt-12">
                <SearchBar
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Cari kategori..."
                />
              </div>
            )}

            <div className="mt-14">
              {hasFilter ? (
                filteredProjects.length > 0 ? (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <KaryaProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 px-4 py-16 text-center">
                    <h3 className="text-lg font-bold text-slate-200">Tidak ada karya yang cocok</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Coba ubah kata kunci atau filter pencarian Anda di atas.
                    </p>
                  </div>
                )
              ) : (
                visibleCategories.length > 0 ? (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {visibleCategories.map((item) => (
                      <KaryaCategoryCard
                        key={item.slug}
                        item={item}
                        onClick={() => handleCategoryClick(item.slug)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 px-4 py-12 text-center">
                    <h3 className="text-lg font-bold text-slate-200">Belum ada kategori</h3>
                    <p className="mt-2 text-sm text-slate-400">Belum ada kategori karya yang dapat ditampilkan saat ini.</p>
                  </div>
                )
              )}
            </div>

            {!hasFilter && !showAll && filteredCategories.length > initialCount && (
              <div className="mt-6 flex justify-center sm:mt-8">
                <OutlineButton onClick={() => setShowAll(true)}>
                  Lihat Lebih Banyak
                </OutlineButton>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default KaryaSection
